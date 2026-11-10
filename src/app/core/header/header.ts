import { ProdutoService, Produto } from '../services/produto.service';
import { HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';


import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { AuthModal } from '../auth-modal/auth-modal';
import { SidePanel } from '../side-panel/side-panel';
import { LojaService } from '../services/loja.service';

import { environment } from '../../../environments/environment';

interface CategoriaTopbar {
  id: number;
  nome: string;
  tipo: 'feminino' | 'masculino' | 'topbar';
  imagemUrl?: string;
  ordem: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AuthModal,
    SidePanel
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  private readonly API = environment.apiUrl;
  private lojaSubscription?: Subscription;

  isSidebarOpen = false;
  isModalOpen = false;
  isSidePanelOpen = false;

  sidePanelMode: 'cart' | 'favorites' = 'cart';

  // Nunca presumir que o usuário está conectado.
  isLoggedIn = false;

  cartCount = 0;
  favoritesCount = 0;

  categoriasTopbar: CategoriaTopbar[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private lojaService: LojaService,
    private cdr: ChangeDetectorRef,
    private produtoService: ProdutoService,
  ) {}

  ngOnInit(): void {
    this.carregarCategoriasTopbar();
    this.verificarSessaoInicial();

    // Preserva as atualizações do carrinho e dos favoritos.
    this.lojaSubscription = this.lojaService.atualizacao$.subscribe(() => {
      if (this.isLoggedIn) {
        this.atualizarContadores();
      }
    });
  }

  ngOnDestroy(): void {
    this.lojaSubscription?.unsubscribe();
  }

  // ==========================================
  // VERIFICAR SESSÃO AO ABRIR A LOJA
  // ==========================================

  private verificarSessaoInicial(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.limparEstadoLocal();
      return;
    }

    this.http.get(`${this.API}/perfil`, {
      headers: this.criarHeaders(token)
    }).subscribe({
      next: () => {
        this.isLoggedIn = true;
        this.atualizarContadores();
        this.cdr.detectChanges();
      },
      error: (erro) => {
        if (erro.status === 401 || erro.status === 403) {
          this.limparSessao();
        } else {
          // Não afirmar que a sessão é válida quando
          // o servidor está indisponível.
          this.isLoggedIn = false;
          this.cartCount = 0;
          this.favoritesCount = 0;
          this.cdr.detectChanges();
        }
      }
    });
  }

  private criarHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private limparEstadoLocal(): void {
    this.isLoggedIn = false;
    this.cartCount = 0;
    this.favoritesCount = 0;
    this.cdr.detectChanges();
  }

  private limparSessao(): void {
    localStorage.removeItem('token');
    this.limparEstadoLocal();
  }

  // ==========================================
  // CARREGAR CATEGORIAS DO TOPBAR
  // ==========================================

  carregarCategoriasTopbar(): void {
    this.http.get<CategoriaTopbar[]>(
      `${this.API}/categorias`
    ).subscribe({
      next: (categorias) => {
        this.categoriasTopbar = [...categorias]
          .filter(categoria => categoria.tipo === 'topbar')
          .sort((a, b) => a.ordem - b.ordem);

        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error(
          'Erro ao carregar categorias do Topbar:',
          erro
        );

        this.categoriasTopbar = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // TRANSFORMAR NOME EM URL
  // ==========================================

  normalizarNomeCategoria(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ==========================================
  // CONTADORES DO CARRINHO E FAVORITOS
  // ==========================================

  atualizarContadores(): void {
    const token = localStorage.getItem('token');

    if (!token || !this.isLoggedIn) {
      this.cartCount = 0;
      this.favoritesCount = 0;
      return;
    }

    const headers = this.criarHeaders(token);

    this.http.get<any[]>(
      `${this.API}/carrinho`,
      { headers }
    ).subscribe({
      next: (itens) => {
        this.cartCount = itens.reduce(
          (total, item) => total + (item.quantidade || 1),
          0
        );
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.cartCount = 0;

        if (erro.status === 401 || erro.status === 403) {
          this.limparSessao();
        }

        this.cdr.detectChanges();
      }
    });

    this.http.get<any[]>(
      `${this.API}/favoritos`,
      { headers }
    ).subscribe({
      next: (itens) => {
        this.favoritesCount = itens.length;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.favoritesCount = 0;

        if (erro.status === 401 || erro.status === 403) {
          this.limparSessao();
        }

        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // PERFIL
  // ==========================================

  clicarNoPerfil(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.isLoggedIn = false;
      this.abrirModal();
      return;
    }

    // Só navegar para o perfil após validar o token.
    this.http.get(`${this.API}/perfil`, {
      headers: this.criarHeaders(token)
    }).subscribe({
      next: () => {
        this.isLoggedIn = true;
        this.router.navigate(['/perfil']);
      },
      error: (erro) => {
        if (erro.status === 401 || erro.status === 403) {
          this.limparSessao();
          this.abrirModal();
        } else {
          console.error('Não foi possível validar a sessão:', erro);
        }
      }
    });
  }

  // ==========================================
  // FAVORITOS
  // ==========================================

  abrirFavoritos(): void {
    if (!this.isLoggedIn) {
      this.abrirModal();
      return;
    }

    this.sidePanelMode = 'favorites';
    this.isSidePanelOpen = true;
    this.atualizarContadores();
  }

  // ==========================================
  // CARRINHO
  // ==========================================

  abrirCarrinho(): void {
    if (!this.isLoggedIn) {
      this.abrirModal();
      return;
    }

    this.sidePanelMode = 'cart';
    this.isSidePanelOpen = true;
    this.atualizarContadores();
  }

  fecharPainelLateral(): void {
    this.isSidePanelOpen = false;
    this.atualizarContadores();
  }

  // ==========================================
  // MENU MOBILE
  // ==========================================

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // ==========================================
  // MODAL DE LOGIN
  // ==========================================

  abrirModal(): void {
    this.isModalOpen = true;
  }

  fecharModal(): void {
    this.isModalOpen = false;
  }

  // ==========================================
  // ITEM REMOVIDO DO PAINEL
  // ==========================================

  onItemRemovidoDoPainel(evento: {
    produtoId: number;
    mode: 'cart' | 'favorites';
  }): void {
    this.atualizarContadores();
  }


  // Pesquisa de produtos
  termoPesquisa = '';
  produtosPesquisa: Produto[] = [];
  pesquisaAberta = false;
  carregandoPesquisa = false;
  erroPesquisa = false;
  private produtosCarregados = false;


  abrirPesquisa(): void {
  this.pesquisaAberta = true;
  this.carregarProdutosPesquisa();
}

carregarProdutosPesquisa(): void {
  if (this.produtosCarregados || this.carregandoPesquisa) {
    return;
  }

  this.carregandoPesquisa = true;
  this.erroPesquisa = false;

  this.produtoService.obterProdutos().subscribe({
    next: (produtos) => {
      this.produtosPesquisa = (produtos || [])
        .filter((produto) => produto.id != null)
        .sort((a, b) => a.nome.localeCompare(b.nome));

      this.produtosCarregados = true;
      this.carregandoPesquisa = false;
      this.cdr.detectChanges();
    },
    error: (erro) => {
      console.error('Erro ao carregar produtos para pesquisa:', erro);
      this.erroPesquisa = true;
      this.carregandoPesquisa = false;
      this.cdr.detectChanges();
    }
  });
}

get produtosFiltrados(): Produto[] {
  const termo = this.termoPesquisa
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!termo) {
    return this.produtosPesquisa;
  }

  return this.produtosPesquisa.filter((produto) => {
    const nome = (produto.nome || '')
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const categoria = (produto.categoria || '')
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return nome.includes(termo) || categoria.includes(termo);
  });
}

abrirProduto(id: number | undefined): void {
  if (id == null) {
    return;
  }

  this.pesquisaAberta = false;
  this.termoPesquisa = '';

  this.router.navigate(['/produto', id]);
}

fecharPesquisa(): void {
  this.pesquisaAberta = false;
}

@HostListener('document:click', ['$event'])
aoClicarForaPesquisa(event: MouseEvent): void {
  const elemento = event.target as HTMLElement;

  if (!elemento.closest('.search-container')) {
    this.fecharPesquisa();
  }
}

tentarCarregarProdutosPesquisa(): void {
  this.produtosCarregados = false;
  this.carregarProdutosPesquisa();
}


onErroImagemPesquisa(event: Event): void {
  const imagem = event.target as HTMLImageElement;

  // Evita repetir a tentativa se o próprio placeholder falhar.
  if (!imagem.src.endsWith('/placeholder.png')) {
    imagem.src = '/placeholder.png';
  }
}
}