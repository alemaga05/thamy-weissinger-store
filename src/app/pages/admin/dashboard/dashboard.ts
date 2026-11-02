import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Categorias } from '../categorias/categorias';

import {
  ProdutoService,
  Produto
} from '../../../core/services/produto.service';

import {
  CategoriaService,
  Categoria
} from '../../../core/services/categoria.service';



interface Banner {
  id: number;
  titulo: string;
  imagemUrl: string;
  link: string | null;
  ativo: boolean;
  ordem: number;
}

interface PedidoAdmin {
  id: number;
  numeroPedido: string;

  cliente: {
    nome: string;
    email: string;
    telefone: string | null;
  };

  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    pais: string;
  };

  subtotal: number;
  frete: number;
  total: number;

  metodoPagamento: string | null;
  gateway: string | null;

  statusPagamento: string;
  statusPedido: string;

  criadoEm: string;
  atualizadoEm: string;

  itens: {
    id: number;
    produtoId: number;
    nomeProduto: string;
    precoUnitario: number;
    quantidade: number;
    tamanho: string | null;
    subtotal: number;
    imagemUrl: string | null;
  }[];
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Categorias
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})


export class Dashboard implements OnInit {

  // =====================================================
  // ADMIN
  // =====================================================

  nomeAdmin = 'Administrador';

  abaAtiva:
    | 'produtos'
    | 'categorias'
    | 'pedidos'
    | 'banners' = 'produtos';


    pedidos: PedidoAdmin[] = [];
    carregandoPedidos = false;
    erroPedidos = '';


    pedidoSelecionado: PedidoAdmin | null = null; 
    exibirModalPedido = false;

    novoStatusPedido = 'EM_PREPARACAO';
    atualizandoStatusPedido = false;


  // =====================================================
  // PRODUTOS
  // =====================================================

 subAbaProduto: string = 'inicial';

  filtroSubcategoria: string = 'todas';

  produtos: Produto[] = [];

  carregandoProdutos = false;


  // =====================================================
  // CATEGORIAS
  // =====================================================

  categorias: Categoria[] = [];

  categoriasPrincipais: Categoria[] = [];

  carregandoCategorias = false;


  // =====================================================
  // MODAL DE PRODUTO
  // =====================================================

  exibirModal = false;

  editando = false;

  idProdutoEmEdicao: number | null = null;


  // =====================================================
  // SUBCATEGORIAS DISPONÍVEIS
  // =====================================================

  subcategoriasDisponiveis: string[] = [];


  // =====================================================
  // FORMULÁRIO DE PRODUTO
  // =====================================================

  formProduto: Produto = {

    nome: '',

    descricao: '',

    preco: 0,

    categoria: 'feminino',

    subcategoria: '',

    tamanhos: '',

    estoque: 0,

    imagemUrl: '',

    popular: false

  };


  // =====================================================
  // CONSTRUTOR
  // =====================================================

  constructor(
    private router: Router,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private http: HttpClient
  ) {}


  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  ngOnInit(): void {

    const nomeSalvo =
      localStorage.getItem('user_nome');

    if (nomeSalvo) {
      this.nomeAdmin = nomeSalvo;
    }

    this.carregarProdutos();

    this.carregarCategorias();
  }


  // =====================================================
  // CARREGAR PRODUTOS
  // =====================================================

  carregarProdutos(): void {

    this.carregandoProdutos = true;

    this.produtoService.obterProdutos().subscribe({

      next: (dados: Produto[]) => {

        this.produtos = dados;

        this.carregandoProdutos = false;

      },

      error: (err: any) => {

        console.error(
          'Erro ao carregar produtos:',
          err
        );

        this.carregandoProdutos = false;

      }

    });

  }


  // =====================================================
  // CARREGAR CATEGORIAS DO BANCO
  // =====================================================
carregarCategorias(): void {

  this.carregandoCategorias = true;

  this.categoriaService.obterCategorias().subscribe({

    next: (dados: Categoria[]) => {

      console.log('Categorias carregadas:', dados);

      // Guarda todas as categorias normalmente
      this.categorias = dados.sort(
        (a, b) => a.ordem - b.ordem
      );

      // =====================================================
      // CATEGORIAS PRINCIPAIS / PÁGINAS
      // =====================================================

      // Feminino e Masculino são páginas FIXAS.
      // Elas não dependem de existir um registro específico
      // delas na tabela de categorias.

      const femininoFixo: Categoria = {
        id: -1,
        nome: 'Feminino',
        tipo: 'feminino',
        imagemUrl: '',
        ordem: 1
      };

      const masculinoFixo: Categoria = {
        id: -2,
        nome: 'Masculino',
        tipo: 'masculino',
        imagemUrl: '',
        ordem: 2
      };

      // Somente categorias criadas no Topbar
      const categoriasTopbar =
        this.categorias
          .filter(categoria => categoria.tipo === 'topbar')
          .sort((a, b) => a.ordem - b.ordem);

      // Junta as páginas fixas + categorias do Topbar
      this.categoriasPrincipais = [
        femininoFixo,
        masculinoFixo,
        ...categoriasTopbar
      ];

      console.log(
        'Categorias principais:',
        this.categoriasPrincipais
      );

      this.carregandoCategorias = false;

      this.aoMudarCategoria();

    },

    error: (err: any) => {

      console.error(
        'Erro ao carregar categorias:',
        err
      );

      this.categorias = [];

      // Mesmo se a API falhar, as páginas fixas
      // continuam existindo.
      this.categoriasPrincipais = [
        {
          id: -1,
          nome: 'Feminino',
          tipo: 'feminino',
          imagemUrl: '',
          ordem: 1
        },
        {
          id: -2,
          nome: 'Masculino',
          tipo: 'masculino',
          imagemUrl: '',
          ordem: 2
        }
      ];

      this.carregandoCategorias = false;

    }

  });

}


  get categoriasDinamicas(): Categoria[] {
    return this.categorias
      .filter(categoria => categoria.tipo === 'topbar')
      .sort((a, b) => a.ordem - b.ordem);
  }

  // =====================================================
  // PRODUTOS FILTRADOS
  // =====================================================

  get produtosFiltrados(): Produto[] {

  if (this.subAbaProduto === 'inicial') {
    return this.produtos;
  }

  let filtrados = this.produtos.filter(produto =>
    this.normalizarTexto(produto.categoria || '') ===
    this.normalizarTexto(this.subAbaProduto)
  );

  if (this.filtroSubcategoria !== 'todas') {
    filtrados = filtrados.filter(produto =>
      this.normalizarTexto(produto.subcategoria || '') ===
      this.normalizarTexto(this.filtroSubcategoria)
    );
  }

  return filtrados;
}

  // =====================================================
  // MUDAR SUB-ABA DE PRODUTOS
  // =====================================================

  mudarSubAba(aba: string): void {
  this.subAbaProduto = aba;
  this.filtroSubcategoria = 'todas';
}


  // =====================================================
  // ALTERAÇÃO DA CATEGORIA DO PRODUTO
  // =====================================================

  aoMudarCategoria(): void {

  const categoriaSelecionada =
    this.normalizarTexto(
      this.formProduto.categoria || ''
    );

  // =====================================================
  // FEMININO
  // =====================================================

  if (categoriaSelecionada === 'feminino') {

    this.subcategoriasDisponiveis =
      this.obterNomesCategorias('feminino');

  }

  // =====================================================
  // MASCULINO
  // =====================================================

  else if (categoriaSelecionada === 'masculino') {

    this.subcategoriasDisponiveis =
      this.obterNomesCategorias('masculino');

  }

  // =====================================================
  // CATEGORIAS CRIADAS NO TOPBAR
  // =====================================================

  else {

    this.subcategoriasDisponiveis = [];

    this.formProduto.subcategoria = '';

    return;
  }

  // =====================================================
  // GARANTE QUE A SUBCATEGORIA ATUAL CONTINUE VÁLIDA
  // =====================================================

  const subcategoriaAtual =
    this.formProduto.subcategoria || '';

  const existeSubcategoria =
    this.subcategoriasDisponiveis.some(
      sub =>
        this.normalizarTexto(sub) ===
        this.normalizarTexto(subcategoriaAtual)
    );

  if (!existeSubcategoria) {

    this.formProduto.subcategoria =
      this.subcategoriasDisponiveis.length > 0
        ? this.subcategoriasDisponiveis[0]
        : '';

  }

}
  // =====================================================
  // OBTER NOMES DAS CATEGORIAS
  // =====================================================

  obterNomesCategorias(
    tipo: 'feminino' | 'masculino' | 'topbar'
  ): string[] {

    return this.categorias

      .filter(
        categoria =>
          categoria.tipo === tipo
      )

      .sort(
        (a, b) =>
          a.ordem - b.ordem
      )

      .map(
        categoria =>
          categoria.nome
      );

  }


  // =====================================================
  // NORMALIZAR TEXTO
  // =====================================================

  normalizarTexto(
    texto: string
  ): string {

    return texto
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );

  }


  // =====================================================
  // ABRIR MODAL — NOVO PRODUTO
  // =====================================================

  abrirModalNovo(): void {

  this.editando = false;

  this.idProdutoEmEdicao = null;

  const primeiraCategoria =
    this.categoriasPrincipais.length > 0
      ? this.categoriasPrincipais[0].nome
      : '';

  this.formProduto = {

    nome: '',

    descricao: '',

    preco: 0,

    categoria: primeiraCategoria,

    subcategoria: '',

    tamanhos: '',

    estoque: 0,

    imagemUrl: '',

    popular: false

  };

  this.aoMudarCategoria();

  this.exibirModal = true;
}


  // =====================================================
  // ABRIR MODAL — EDITAR PRODUTO
  // =====================================================

  abrirModalEditar(
    produto: Produto
  ): void {

    this.editando = true;

    this.idProdutoEmEdicao =
      produto.id || null;


    this.formProduto = {
      ...produto
    };


    this.aoMudarCategoria();


    /*
     * Depois de carregar as categorias,
     * garantimos que a subcategoria original
     * do produto continue selecionada.
     */

    if (
      produto.subcategoria
    ) {

      const subcategoriaEncontrada =
        this.subcategoriasDisponiveis.find(
          sub =>
            this.normalizarTexto(sub) ===
            this.normalizarTexto(
              produto.subcategoria || ''
            )
        );


      if (
        subcategoriaEncontrada
      ) {

        this.formProduto.subcategoria =
          subcategoriaEncontrada;

      }

    }


    this.exibirModal = true;

  }


  // =====================================================
  // FECHAR MODAL
  // =====================================================

  fecharModal(): void {

    this.exibirModal = false;

  }


  // =====================================================
  // SALVAR PRODUTO
  // =====================================================

  salvarProduto(): void {

    if (
      !this.formProduto.nome ||
      this.formProduto.preco <= 0
    ) {

      alert(
        'Por favor, preencha o nome e um preço válido.'
      );

      return;

    }


    // ===================================================
    // EDITANDO
    // ===================================================

    if (
      this.editando &&
      this.idProdutoEmEdicao
    ) {

      const id =
        this.idProdutoEmEdicao;


      const produtoAnterior =
        this.produtos.find(
          p => p.id === id
        );


      // Fecha imediatamente
      this.fecharModal();


      this.produtoService
        .atualizarProduto(
          id,
          this.formProduto
        )
        .subscribe({

          next: (
            produtoAtualizado
          ) => {

            const index =
              this.produtos.findIndex(
                p => p.id === id
              );


            if (index !== -1) {

              this.produtos[index] =
                produtoAtualizado;

            }


            this.produtos =
              [...this.produtos];

          },


          error: (err: any) => {

            if (
              produtoAnterior
            ) {

              const index =
                this.produtos.findIndex(
                  p => p.id === id
                );


              if (
                index !== -1
              ) {

                this.produtos[index] =
                  produtoAnterior;

                this.produtos =
                  [...this.produtos];

              }

            }


            alert(
              'Erro ao atualizar: ' +
              (
                err.error?.mensagem ||
                'Falha na requisição'
              )
            );

          }

        });

    }


    // ===================================================
    // CADASTRANDO NOVO PRODUTO
    // ===================================================

    else {

      const produtoParaCriar =
        {
          ...this.formProduto
        };


      // Fecha imediatamente
      this.fecharModal();


      this.produtoService
        .criarProduto(
          produtoParaCriar
        )
        .subscribe({

          next: (
            novoProduto
          ) => {

            this.produtos =
              [
                ...this.produtos,
                novoProduto
              ];

          },


          error: (err: any) => {

            alert(
              'Erro ao cadastrar: ' +
              (
                err.error?.mensagem ||
                'Falha na requisição'
              )
            );

          }

        });

    }

  }


  // =====================================================
  // EXCLUIR PRODUTO
  // =====================================================

  excluirProduto(
    id: number | undefined
  ): void {

    if (!id) {
      return;
    }


    if (
      confirm(
        'Tem certeza de que deseja excluir este produto?'
      )
    ) {

      const produtoExcluido =
        this.produtos.find(
          p => p.id === id
        );


      // Remove imediatamente da tela
      this.produtos =
        this.produtos.filter(
          p => p.id !== id
        );


      this.produtoService
        .deletarProduto(id)
        .subscribe({

          next: () => {

            // Produto já foi removido
            // visualmente.

          },


          error: (err: any) => {

            // Restaura caso dê erro
            if (
              produtoExcluido
            ) {

              this.produtos =
                [
                  ...this.produtos,
                  produtoExcluido
                ];

            }


            alert(
              'Erro ao excluir: ' +
              (
                err.error?.mensagem ||
                'Falha na requisição'
              )
            );

          }

        });

    }

  }


  // =====================================================
  // MUDAR ABA PRINCIPAL
  // =====================================================

  
mudarAba(
  aba: 'produtos' | 'categorias' | 'pedidos' | 'banners'
): void {
  this.abaAtiva = aba;

  if (aba === 'pedidos') {
    this.carregarPedidos();
  }

  if (aba === 'banners') {
    this.carregarBanners();
  }
}


carregarPedidos(): void {
  this.carregandoPedidos = true;
  this.erroPedidos = '';

  const token = localStorage.getItem('token');

  if (!token) {
    this.pedidos = [];
    this.erroPedidos = 'Sessão expirada. Faça login novamente.';
    this.carregandoPedidos = false;
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.get<PedidoAdmin[]>(
    'http://localhost:3000/admin/pedidos',
    { headers }
  ).subscribe({
    next: (resposta) => {
      const pedidos = Array.isArray(resposta) ? resposta : [];

      this.pedidos = pedidos.map((pedido) => ({
        ...pedido,
        subtotal: Number(pedido.subtotal ?? 0),
        frete: Number(pedido.frete ?? 0),
        total: Number(pedido.total ?? 0),

        cliente: {
          nome: pedido.cliente?.nome || 'Cliente não identificado',
          email: pedido.cliente?.email || '',
          telefone: pedido.cliente?.telefone || null
        },

        endereco: {
          rua: pedido.endereco?.rua || '',
          bairro: pedido.endereco?.bairro || '',
          cidade: pedido.endereco?.cidade || '',
          pais: pedido.endereco?.pais || 'Brasil'
        },

        itens: Array.isArray(pedido.itens)
          ? pedido.itens.map((item) => ({
              ...item,
              precoUnitario: Number(item.precoUnitario ?? 0),
              quantidade: Number(item.quantidade ?? 0),
              subtotal: Number(item.subtotal ?? 0),
              imagemUrl: item.imagemUrl || null
            }))
          : []
      }));

      this.carregandoPedidos = false;

      console.log('Pedidos carregados no admin:', this.pedidos);
    },

    error: (err) => {
      console.error('Erro ao carregar pedidos administrativos:', err);

      this.pedidos = [];
      this.erroPedidos =
        err.error?.mensagem ||
        'Não foi possível carregar os pedidos.';

      this.carregandoPedidos = false;
    }
  });
}
 
  // =====================================================
  // SAIR
  // =====================================================

  sair(): void {

    localStorage.clear();

    this.router.navigate(
      ['/admin/login']
    );

  }

  get pedidosAprovados(): number {
    return this.pedidos.filter(
      pedido => pedido.statusPagamento === 'APROVADO'
    ).length;
  }

  get pedidosPendentes(): number {
    return this.pedidos.filter(
      pedido => pedido.statusPagamento === 'PENDENTE'
    ).length;
  }


  abrirDetalhesPedido(pedido: PedidoAdmin): void {

  this.pedidoSelecionado = pedido;

  this.novoStatusPedido =
    pedido.statusPedido === 'AGUARDANDO_PAGAMENTO'
      ? 'EM_PREPARACAO'
      : pedido.statusPedido;

  this.exibirModalPedido = true;
}

  fecharDetalhesPedido(): void {
    this.exibirModalPedido = false;
    this.pedidoSelecionado = null;
  }

  atualizarStatusPedido(): void {

  if (!this.pedidoSelecionado) {
    return;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    alert('Sessão expirada. Faça login novamente.');
    return;
  }

  const status = this.novoStatusPedido;

  if (!status) {
    alert('Selecione um status válido.');
    return;
  }

  this.atualizandoStatusPedido = true;

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.put<any>(
    `http://localhost:3000/admin/pedidos/${this.pedidoSelecionado.id}/status`,
    {
      statusPedido: status
    },
    { headers }
  ).subscribe({

    next: (resposta) => {

      console.log(
        '✅ Status atualizado:',
        resposta
      );

      if (this.pedidoSelecionado) {

        this.pedidoSelecionado = {
          ...this.pedidoSelecionado,
          statusPedido:
            resposta.pedido.statusPedido
        };

      }

      const index = this.pedidos.findIndex(
        pedido =>
          pedido.id === this.pedidoSelecionado?.id
      );

      if (index !== -1) {

        this.pedidos[index] = {
          ...this.pedidos[index],
          statusPedido:
            resposta.pedido.statusPedido
        };

        this.pedidos = [...this.pedidos];

      }

      this.novoStatusPedido =
        resposta.pedido.statusPedido;

      this.atualizandoStatusPedido = false;

      alert('Status do pedido atualizado com sucesso.');

    },

    error: (err) => {

      console.error(
        '❌ Erro ao atualizar status:',
        err
      );

      this.atualizandoStatusPedido = false;

      alert(
        err.error?.mensagem ||
        'Não foi possível atualizar o status do pedido.'
      );

    }

  });
}

  textoStatusPedido(status: string): string {
  const mapa: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
    PAGAMENTO_APROVADO: 'Pagamento aprovado',
    EM_PREPARACAO: 'Em preparação',
    ENVIADO: 'Enviado',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado'
  };

  return mapa[status] || status;
}

classeStatusPedido(status: string): string {
  const mapa: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: 'status-pendente',
    PAGAMENTO_APROVADO: 'status-aprovado',
    EM_PREPARACAO: 'status-preparacao',
    ENVIADO: 'status-enviado',
    ENTREGUE: 'status-entregue',
    CANCELADO: 'status-cancelado'
  };

  return mapa[status] || 'status-pendente';
}

  filtroStatusPedido: string = 'TODOS';

  buscaPedido: string = '';

  get pedidosFiltrados(): PedidoAdmin[] {

  const busca = this.buscaPedido
    .toLowerCase()
    .trim();

  return this.pedidos.filter(pedido => {

    // ==========================================
    // FILTRO POR STATUS
    // ==========================================

    const correspondeStatus =
      this.filtroStatusPedido === 'TODOS' ||
      pedido.statusPedido === this.filtroStatusPedido;


    // ==========================================
    // FILTRO POR BUSCA
    // ==========================================

    if (!busca) {
      return correspondeStatus;
    }

    const numeroPedido =
      (pedido.numeroPedido || '').toLowerCase();

    const nomeCliente =
      (pedido.cliente?.nome || '').toLowerCase();

    const emailCliente =
      (pedido.cliente?.email || '').toLowerCase();


    const correspondeBusca =
      numeroPedido.includes(busca) ||
      nomeCliente.includes(busca) ||
      emailCliente.includes(busca);


    return correspondeStatus && correspondeBusca;
  });
}

get totalPedidos(): number {
  return this.pedidos.length;
}

get pedidosEmPreparacao(): number {
  return this.pedidos.filter(
    pedido => pedido.statusPedido === 'EM_PREPARACAO'
  ).length;
}

get pedidosEnviados(): number {
  return this.pedidos.filter(
    pedido => pedido.statusPedido === 'ENVIADO'
  ).length;
}

get pedidosEntregues(): number {
  return this.pedidos.filter(
    pedido => pedido.statusPedido === 'ENTREGUE'
  ).length;
}



banners: Banner[] = [];

carregandoBanners = false;
salvandoBanner = false;
mensagemBanner = '';
erroBanner = '';

bannerEmEdicao: number | null = null;

novoBanner = {
  titulo: '',
  imagemUrl: '',
  link: '',
  ativo: true,
  ordem: 0
};


formularioBannerAberto = false;


private obterHeadersBanner(): HttpHeaders {
  const token = localStorage.getItem('token');

  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
}

carregarBanners(): void {
  this.carregandoBanners = true;
  this.erroBanner = '';
  this.mensagemBanner = '';

  this.http.get<Banner[]>(
    'http://localhost:3000/admin/banners',
    { headers: this.obterHeadersBanner() }
  ).subscribe({
    next: (banners) => {
      this.banners = banners;
      this.carregandoBanners = false;
    },
    error: (erro) => {
      console.error('Erro ao carregar banners:', erro);
      this.erroBanner =
        erro.status === 401 || erro.status === 403
          ? 'Você não tem autorização para gerenciar banners. Entre novamente como administrador.'
          : 'Não foi possível carregar os banners.';
      this.carregandoBanners = false;
    }
  });
}

salvarBanner(): void {
  this.mensagemBanner = '';
  this.erroBanner = '';

  const titulo = this.novoBanner.titulo.trim();
  const imagemUrl = this.novoBanner.imagemUrl.trim();
  const link = this.novoBanner.link.trim();

  if (!titulo || !imagemUrl) {
    this.erroBanner = 'Preencha o título e o endereço da imagem.';
    return;
  }

  if (
    !Number.isInteger(Number(this.novoBanner.ordem)) ||
    Number(this.novoBanner.ordem) < 0
  ) {
    this.erroBanner = 'A ordem deve ser um número inteiro igual ou maior que zero.';
    return;
  }

  const dados = {
    titulo,
    imagemUrl,
    link: link || null,
    ativo: this.novoBanner.ativo,
    ordem: Number(this.novoBanner.ordem)
  };

  this.salvandoBanner = true;

  const requisicao = this.bannerEmEdicao === null
    ? this.http.post<Banner>(
        'http://localhost:3000/admin/banners',
        dados,
        { headers: this.obterHeadersBanner() }
      )
    : this.http.put<Banner>(
        `http://localhost:3000/admin/banners/${this.bannerEmEdicao}`,
        dados,
        { headers: this.obterHeadersBanner() }
      );

  requisicao.subscribe({
    next: () => {
      this.mensagemBanner = this.bannerEmEdicao === null
        ? 'Banner cadastrado com sucesso!'
        : 'Banner atualizado com sucesso!';

      this.fecharFormularioBanner();
      this.carregarBanners();
      this.salvandoBanner = false;
    },
    error: (erro) => {
      console.error('Erro ao salvar banner:', erro);
      this.erroBanner =
        erro.error?.mensagem || 'Não foi possível salvar o banner.';
      this.salvandoBanner = false;
    }
  });
}


excluirBanner(banner: Banner): void {
  const confirmar = confirm(
    `Deseja realmente excluir o banner "${banner.titulo}"?`
  );

  if (!confirmar) {
    return;
  }

  this.mensagemBanner = '';
  this.erroBanner = '';

  this.http.delete(
    `http://localhost:3000/admin/banners/${banner.id}`,
    { headers: this.obterHeadersBanner() }
  ).subscribe({
    next: () => {
      this.mensagemBanner = 'Banner excluído com sucesso!';
      this.banners = this.banners.filter(
        item => item.id !== banner.id
      );

      if (this.bannerEmEdicao === banner.id) {
        this.limparFormularioBanner();
      }
    },
    error: (erro) => {
      console.error('Erro ao excluir banner:', erro);
      this.erroBanner =
        erro.error?.mensagem || 'Não foi possível excluir o banner.';
    }
  });
}


editarBanner(banner: Banner): void {
  this.bannerEmEdicao = banner.id;

  this.novoBanner = {
    titulo: banner.titulo,
    imagemUrl: banner.imagemUrl,
    link: banner.link || '',
    ativo: banner.ativo,
    ordem: banner.ordem
  };

  this.mensagemBanner = '';
  this.erroBanner = '';
  this.formularioBannerAberto = true;
}

abrirFormularioBanner(): void {
  this.limparFormularioBanner();
  this.formularioBannerAberto = true;
}

fecharFormularioBanner(): void {
  this.limparFormularioBanner();
  this.formularioBannerAberto = false;
}

limparFormularioBanner(): void {
  this.bannerEmEdicao = null;

  this.novoBanner = {
    titulo: '',
    imagemUrl: '',
    link: '',
    ativo: true,
    ordem: 0
  };

  this.erroBanner = '';
}

}