import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LojaService } from '../../core/services/loja.service';
import { Produto, ProdutoService } from '../../core/services/produto.service';

export interface Product {
  id: number;
  nome: string;
  preco: number;
  imagemUrl: string;
  categoria: string;
  isFavorito: boolean;
}

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class Category implements OnInit {
  categoriaAtual: string = '';
  todosOsProdutos: Product[] = [];
  produtosFiltrados: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private lojaService: LojaService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: any) => {
      this.categoriaAtual = params.get('nome') || '';
      this.carregarProdutosDaAPI();
    });
  }

  carregarProdutosDaAPI(): void {
    this.produtoService.obterProdutos().subscribe({
      next: (dadosBanco: Produto[]) => {
        this.todosOsProdutos = dadosBanco.map((p: Produto) => ({
          id: p.id!,
          nome: p.nome,
          preco: p.preco,
          imagemUrl: p.imagemUrl || '/placeholder.png',
          categoria: p.categoria ? p.categoria.toLowerCase() : '',
          isFavorito: false
        }));

        this.filtrarProdutos();
        this.sincronizarFavoritosComBanco();
      },
      error: (err: any) => console.error('Erro ao carregar produtos da categoria', err)
    });
  }

  filtrarProdutos(): void {
    const categoriaUrl = this.categoriaAtual.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    this.produtosFiltrados = this.todosOsProdutos.filter((produto: Product) => {
      const catProduto = produto.categoria.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      return catProduto === categoriaUrl;
    });
  }

  sincronizarFavoritosComBanco(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Adicionado tipo genérico 
    this.http.get<any[]>('http://localhost:3000/favoritos', { headers }).subscribe({
      next: (favoritosDoBanco: any[]) => {
        const idsFavoritados = favoritosDoBanco.map((f: any) => f.produtoId);
        this.produtosFiltrados.forEach((p: Product) => {
          p.isFavorito = idsFavoritados.includes(p.id);
        });
      },
      error: (err: any) => console.error('Erro ao sincronizar favoritos:', err)
    });
  }

  toggleFavorito(event: Event, product: Product): void {
    event.stopPropagation();
    event.preventDefault();

    product.isFavorito = !product.isFavorito;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para favoritar!');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (product.isFavorito) {
      this.http.post('http://localhost:3000/favoritos', { produtoId: product.id }, { headers })
        .subscribe({
          next: () => this.lojaService.notificarAtualizacao(),
          error: (err: any) => console.error('Erro ao favoritar:', err)
        });
    } else {
      // Adicionado tipo genérico 
      this.http.get<any[]>('http://localhost:3000/favoritos', { headers }).subscribe({
        next: (favoritos: any[]) => {
          const itemFav = favoritos.find((f: any) => f.produtoId === product.id);
          if (itemFav) {
            this.http.delete(`http://localhost:3000/favoritos/${itemFav.id}`, { headers }).subscribe({
              next: () => this.lojaService.notificarAtualizacao(),
              error: (err: any) => console.error('Erro ao remover favorito:', err)
            });
          }
        },
        error: (err: any) => console.error('Erro ao buscar favoritos:', err)
      });
    }
  }

  adicionarCarrinhoRapido(event: Event, product: Product): void {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para adicionar ao carrinho!');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = { produtoId: product.id, tamanho: 'Único', quantidade: 1 };

    this.http.post('http://localhost:3000/carrinho', payload, { headers })
      .subscribe({
        next: () => {
          alert('Produto adicionado ao carrinho!');
          this.lojaService.notificarAtualizacao();
        },
        error: (err: any) => console.error('Erro ao adicionar ao carrinho:', err)
      });
  }

  formatarPreco(valor: number): string {
    return valor ? valor.toFixed(2).replace('.', ',') : '0,00';
  }
}