import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LojaService } from '../../core/services/loja.service'; 
import { Produto, ProdutoService } from '../../core/services/produto.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
  
  produto: any = null;
  imagemPrincipal = '';
  tamanhos: string[] = [];
  tamanhoSelecionado = '';
  quantidadeSelecionada = 1;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private lojaService: LojaService,
    private produtoService: ProdutoService,
    private cdr: ChangeDetectorRef // Injetamos o detector de mudanças
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id') || params.get('nome');
      if (idParam) {
        this.carregarProduto(idParam);
      }
    });
  }

  carregarProduto(parametro: string): void {
    this.produtoService.obterProdutos().subscribe({
      next: (dadosBanco: any[]) => {
        const produtoEncontrado = dadosBanco.find((p: any) => 
          String(p.id) === parametro || 
          p.nome?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') === parametro.toLowerCase()
        );

        if (!produtoEncontrado) {
          console.warn('Produto não encontrado na lista.');
          return;
        }

        // Criamos o objeto completo do produto
        this.produto = {
          id: produtoEncontrado.id,
          nome: produtoEncontrado.nome || produtoEncontrado.titulo || 'Produto sem nome',
          categoria: produtoEncontrado.categoria || 'Geral',
          vendedor: 'Thamy Fitwear',
          preco: produtoEncontrado.preco || produtoEncontrado.valor || 0,
          estoque: produtoEncontrado.estoque ?? 10,
          descricao: produtoEncontrado.descricao || 'Sem descrição cadastrada.',
          imagens: produtoEncontrado.imagemUrl ? [produtoEncontrado.imagemUrl] : (produtoEncontrado.imagens || ['/placeholder.png']),
          isFavorito: false
        };

        this.imagemPrincipal = this.produto.imagens[0];

        if (produtoEncontrado.tamanhos) {
          this.tamanhos = typeof produtoEncontrado.tamanhos === 'string' 
            ? produtoEncontrado.tamanhos.split(',').map((t: string) => t.trim()) 
            : produtoEncontrado.tamanhos;
        } else {
          this.tamanhos = ['P', 'M', 'G', 'GG'];
        }

        // Força a atualização imediata da tela
        this.cdr.detectChanges();

        this.sincronizarFavoritoComBanco();
      },
      error: (err: any) => console.error('Erro ao carregar produtos:', err)
    });
  }

  verificarLogin(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para realizar esta ação!');
      return false;
    }
    return true;
  }

  sincronizarFavoritoComBanco(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<any[]>('http://localhost:3000/favoritos', { headers }).subscribe({
      next: (favoritosDoBanco: any[]) => {
        const idsFavoritados = favoritosDoBanco.map((f: any) => f.produtoId);
        if (this.produto) {
          this.produto.isFavorito = idsFavoritados.includes(this.produto.id);
          this.cdr.detectChanges(); // Atualiza a tela após checar os favoritos
        }
      },
      error: (err: any) => console.error('Erro ao sincronizar favoritos', err)
    });
  }

  favoritar(): void {
    if (!this.verificarLogin()) return; 
    this.produto.isFavorito = !this.produto.isFavorito; 

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    if (this.produto.isFavorito) {
      this.http.post('http://localhost:3000/favoritos', { produtoId: this.produto.id }, { headers }).subscribe();
    } else {
      this.http.get<any[]>('http://localhost:3000/favoritos', { headers }).subscribe({
        next: (favoritos: any[]) => {
          const itemFav = favoritos.find((f: any) => f.produtoId === this.produto.id);
          if (itemFav) {
            this.http.delete(`http://localhost:3000/favoritos/${itemFav.id}`, { headers }).subscribe();
          }
        }
      });
    }
  }

  trocarImagem(img: string): void { this.imagemPrincipal = img; }
  selecionarTamanho(tamanho: string): void { this.tamanhoSelecionado = tamanho; }
  
  aumentarQuantidade(): void {
    if (this.quantidadeSelecionada < this.produto.estoque) this.quantidadeSelecionada++;
  }

  diminuirQuantidade(): void {
    if (this.quantidadeSelecionada > 1) this.quantidadeSelecionada--;
  }

  comprar(): void {
    if (!this.verificarLogin()) return;

    if (!this.tamanhoSelecionado) {
      alert('⚠️ Por favor, selecione um tamanho antes de adicionar ao carrinho!');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = {
      produtoId: this.produto.id,
      tamanho: this.tamanhoSelecionado,
      quantidade: this.quantidadeSelecionada
    };

    this.http.post('http://localhost:3000/carrinho', payload, { headers })
      .subscribe({
        next: () => {
          alert('✅ Item adicionado ao carrinho com sucesso!');
          this.lojaService.notificarAtualizacao();
        },
        error: (err: any) => console.error('Erro ao adicionar ao carrinho.', err)
      });
  }
}