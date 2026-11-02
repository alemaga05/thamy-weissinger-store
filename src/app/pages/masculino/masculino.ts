import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { LojaService } from '../../core/services/loja.service';

import {
  Produto,
  ProdutoService
} from '../../core/services/produto.service';


// =====================================================
// PRODUTO
// =====================================================

export interface Product {
  id: number;
  nome: string;
  preco: number;
  imagemUrl: string;
  subcategoria?: string;
  isFavorito: boolean;
}


// =====================================================
// CATEGORIA
// =====================================================

export interface Categoria {
  id: number;
  nome: string;
  tipo: 'feminino' | 'masculino' | 'topbar';
  imagemUrl: string;
  ordem: number;
}


// =====================================================
// COMPONENTE
// =====================================================

@Component({
  selector: 'app-masculino',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './masculino.html',
  styleUrl: './masculino.css'
})

export class Masculino implements OnInit {

  // =====================================================
  // CATEGORIAS
  // =====================================================

  categoriasMasculinas: Categoria[] = [];

  /**
   * "TODOS" continua sendo um filtro especial.
   *
   * As demais categorias serão carregadas
   * automaticamente do banco de dados.
   */
  subcategories: {
    name: string;
    sub: string;
    image: string;
  }[] = [];


  // =====================================================
  // PRODUTOS
  // =====================================================

  produtosDoBanco: Product[] = [];

  subcategoriaSelecionada: string = 'todos';

  tituloSecao: string = 'TODOS OS PRODUTOS';


  // =====================================================
  // CONTROLE DE CARREGAMENTO
  // =====================================================

  carregandoCategorias: boolean = false;

  carregandoProdutos: boolean = false;


  // =====================================================
  // CONSTRUTOR
  // =====================================================

  constructor(
    private http: HttpClient,
    private lojaService: LojaService,
    private produtoService: ProdutoService,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  ngOnInit(): void {

    this.subcategoriaSelecionada = 'todos';

    this.tituloSecao = 'TODOS OS PRODUTOS';

    // Primeiro carregamos as categorias
    this.carregarCategoriasMasculinas();

    // Depois carregamos os produtos
    this.carregarProdutosMasculinos();
  }


  // =====================================================
  // CARREGAR CATEGORIAS MASCULINAS
  // =====================================================

  carregarCategoriasMasculinas(): void {

    this.carregandoCategorias = true;

    this.http
      .get<Categoria[]>(
        'http://localhost:3000/categorias'
      )
      .subscribe({

        next: (categorias: Categoria[]) => {

          /**
           * Pegamos somente as categorias
           * do tipo masculino.
           */
          this.categoriasMasculinas = categorias
            .filter(
              (categoria: Categoria) =>
                categoria.tipo === 'masculino'
            )
            .sort(
              (a: Categoria, b: Categoria) =>
                a.ordem - b.ordem
            );


          /**
           * Montamos os cards da página.
           *
           * "TODOS" é o único item especial
           * que não vem do banco.
           */
          this.subcategories = [

            {
              name: 'TODOS',
              sub: 'todos',
              image: '/categoriaMasculinaPage.png'
            },

            ...this.categoriasMasculinas.map(
              (categoria: Categoria) => ({

                name: categoria.nome.toUpperCase(),

                /**
                 * Esse valor será usado para
                 * comparar com produto.subcategoria.
                 */
                sub: this.normalizarTexto(
                  categoria.nome
                ),

                /**
                 * Imagem cadastrada pelo Admin.
                 */
                image:
                  categoria.imagemUrl ||
                  '/placeholder.png'

              })
            )

          ];


          console.log(
            'Categorias masculinas carregadas:',
            this.subcategories
          );


          this.carregandoCategorias = false;

          this.cdr.detectChanges();
        },


        error: (err: any) => {

          console.error(
            'Erro ao buscar categorias masculinas:',
            err
          );

          this.categoriasMasculinas = [];


          /**
           * Mesmo que a API falhe,
           * "TODOS" continua disponível.
           */
          this.subcategories = [

            {
              name: 'TODOS',
              sub: 'todos',
              image: '/categoriaMasculinaPage.png'
            }

          ];


          this.carregandoCategorias = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // CARREGAR PRODUTOS MASCULINOS
  // =====================================================

  carregarProdutosMasculinos(): void {

    this.carregandoProdutos = true;

    this.produtoService.obterProdutos().subscribe({

      next: (dadosBanco: Produto[]) => {

        /**
         * Primeiro pegamos somente produtos masculinos.
         */
        const apenasMasculinos = dadosBanco.filter(
          (p: Produto) =>
            this.normalizarTexto(
              p.categoria || ''
            ) === 'masculino'
        );


        /**
         * Depois transformamos para o formato
         * utilizado pela página.
         */
        this.produtosDoBanco = apenasMasculinos.map(
          (p: Produto) => ({

            id: p.id!,

            nome: p.nome,

            preco: Number(p.preco),

            imagemUrl:
              p.imagemUrl ||
              '/placeholder.png',

            subcategoria: p.subcategoria
              ? this.normalizarTexto(p.subcategoria)
              : '',

            isFavorito: false

          })
        );


        console.log(
          'Produtos masculinos carregados:',
          this.produtosDoBanco
        );


        this.carregandoProdutos = false;

        this.cdr.detectChanges();


        /**
         * Depois de carregar os produtos,
         * verifica os favoritos do usuário.
         */
        this.sincronizarFavoritosComBanco();
      },


      error: (err: any) => {

        console.error(
          'Erro ao buscar produtos masculinos:',
          err
        );

        this.produtosDoBanco = [];

        this.carregandoProdutos = false;

        this.cdr.detectChanges();
      }

    });
  }


  // =====================================================
  // PRODUTOS EXIBIDOS
  // =====================================================

  get products(): Product[] {

    /**
     * "TODOS" mostra todos os produtos masculinos.
     */
    if (
      this.subcategoriaSelecionada === 'todos'
    ) {

      return this.produtosDoBanco;
    }


    /**
     * Caso contrário,
     * filtramos pela subcategoria selecionada.
     */
    return this.produtosDoBanco.filter(
      (p: Product) =>
        this.normalizarTexto(
          p.subcategoria || ''
        ) ===
        this.normalizarTexto(
          this.subcategoriaSelecionada
        )
    );
  }


  // =====================================================
  // FILTRO POR SUBCATEGORIA
  // =====================================================

  filtrarPorSubcategoria(
    subValue: string,
    nomeExibicao: string
  ): void {

    this.subcategoriaSelecionada =
      this.normalizarTexto(subValue);


    if (
      this.subcategoriaSelecionada === 'todos'
    ) {

      this.tituloSecao =
        'TODOS OS PRODUTOS';

    } else {

      this.tituloSecao =
        nomeExibicao;
    }


    console.log(
      'Subcategoria masculina selecionada:',
      this.subcategoriaSelecionada
    );


    this.cdr.detectChanges();
  }


  // =====================================================
  // NORMALIZAR TEXTO
  // =====================================================

  /**
   * Converte textos para um formato padrão.
   *
   * Exemplos:
   *
   * "Camisas"    → "camisas"
   * "SHORTS"     → "shorts"
   * "Regatas"    → "regatas"
   * "Conjuntos"  → "conjuntos"
   *
   * Também remove acentos.
   */
  normalizarTexto(valor: string): string {

    return valor
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }


  // =====================================================
  // SINCRONIZAR FAVORITOS COM O BANCO
  // =====================================================

  sincronizarFavoritosComBanco(): void {

    const token =
      localStorage.getItem('token');


    /**
     * Usuário não logado:
     * todos os corações ficam vazios.
     */
    if (!token) {

      this.produtosDoBanco.forEach(
        (produto: Product) => {

          produto.isFavorito = false;

        }
      );

      this.cdr.detectChanges();

      return;
    }


    const headers = new HttpHeaders()
      .set(
        'Authorization',
        `Bearer ${token}`
      );


    this.http
      .get<any[]>(
        'http://localhost:3000/favoritos',
        { headers }
      )
      .subscribe({

        next: (favoritosDoBanco: any[]) => {

          /**
           * Pegamos somente os IDs dos produtos
           * favoritados.
           */
          const idsFavoritados =
            favoritosDoBanco.map(
              (favorito: any) =>
                Number(favorito.produtoId)
            );


          this.produtosDoBanco.forEach(
            (produto: Product) => {

              produto.isFavorito =
                idsFavoritados.includes(
                  Number(produto.id)
                );

            }
          );


          console.log(
            '❤️ Favoritos masculinos sincronizados:',
            idsFavoritados
          );


          this.cdr.detectChanges();
        },


        error: (err: any) => {

          console.error(
            'Erro ao sincronizar favoritos:',
            err
          );


          /**
           * Se houver erro,
           * deixamos os corações vazios.
           */
          this.produtosDoBanco.forEach(
            (produto: Product) => {

              produto.isFavorito = false;

            }
          );


          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // FAVORITAR / DESFAVORITAR
  // =====================================================

  toggleFavorito(
    event: Event,
    product: Product
  ): void {

    /**
     * Impede que o clique no coração
     * abra a página do produto.
     */
    event.preventDefault();
    event.stopPropagation();


    const token =
      localStorage.getItem('token');


    if (!token) {

      alert(
        'Você precisa estar logado para favoritar produtos!'
      );

      return;
    }


    const headers = new HttpHeaders()
      .set(
        'Authorization',
        `Bearer ${token}`
      );


    /**
     * Guarda o estado anterior.
     */
    const estadoAnterior =
      product.isFavorito;


    // ===================================================
    // ADICIONAR AOS FAVORITOS
    // ===================================================

    if (!estadoAnterior) {

      this.http
        .post(
          'http://localhost:3000/favoritos',
          {
            produtoId: product.id
          },
          { headers }
        )
        .subscribe({

          next: () => {

            product.isFavorito = true;

            this.cdr.detectChanges();

            this.lojaService
              .notificarAtualizacao();

            console.log(
              `❤️ Produto ${product.id} adicionado aos favoritos.`
            );
          },


          error: (err: any) => {

            product.isFavorito =
              estadoAnterior;

            this.cdr.detectChanges();

            console.error(
              'Erro ao favoritar produto:',
              err
            );

            alert(
              'Não foi possível adicionar o produto aos favoritos.'
            );
          }

        });

    }


    // ===================================================
    // REMOVER DOS FAVORITOS
    // ===================================================

    else {

      this.http
        .get<any[]>(
          'http://localhost:3000/favoritos',
          { headers }
        )
        .subscribe({

          next: (favoritos: any[]) => {

            /**
             * Procura o registro do favorito
             * através do ID do produto.
             */
            const itemFav =
              favoritos.find(
                (favorito: any) =>
                  Number(favorito.produtoId) ===
                  Number(product.id)
              );


            /**
             * Se não encontrou,
             * sincroniza novamente.
             */
            if (!itemFav) {

              console.warn(
                `Favorito do produto ${product.id} não encontrado.`
              );

              this.sincronizarFavoritosComBanco();

              return;
            }


            /**
             * Remove o favorito real do banco.
             */
            this.http
              .delete(
                `http://localhost:3000/favoritos/${itemFav.id}`,
                { headers }
              )
              .subscribe({

                next: () => {

                  product.isFavorito = false;

                  this.cdr.detectChanges();

                  this.lojaService
                    .notificarAtualizacao();

                  console.log(
                    `🤍 Produto ${product.id} removido dos favoritos.`
                  );
                },


                error: (err: any) => {

                  product.isFavorito =
                    estadoAnterior;

                  this.cdr.detectChanges();

                  console.error(
                    'Erro ao remover favorito:',
                    err
                  );

                  alert(
                    'Não foi possível remover o produto dos favoritos.'
                  );
                }

              });

          },


          error: (err: any) => {

            product.isFavorito =
              estadoAnterior;

            this.cdr.detectChanges();

            console.error(
              'Erro ao buscar favoritos:',
              err
            );
          }

        });
    }
  }


  // =====================================================
  // ADICIONAR AO CARRINHO
  // =====================================================

  adicionarCarrinhoRapido(
    event: Event,
    product: Product
  ): void {

    /**
     * Impede que o botão
     * abra os detalhes do produto.
     */
    event.preventDefault();
    event.stopPropagation();


    const token =
      localStorage.getItem('token');


    if (!token) {

      alert(
        'Você precisa estar logado para adicionar ao carrinho!'
      );

      return;
    }


    const headers = new HttpHeaders()
      .set(
        'Authorization',
        `Bearer ${token}`
      );


    const payload = {

      produtoId: product.id,

      tamanho: 'Único',

      quantidade: 1

    };


    this.http
      .post(
        'http://localhost:3000/carrinho',
        payload,
        { headers }
      )
      .subscribe({

        next: () => {

          alert(
            'Produto adicionado ao carrinho!'
          );

          this.lojaService
            .notificarAtualizacao();
        },


        error: (err: any) => {

          console.error(
            'Erro ao adicionar ao carrinho:',
            err
          );

          alert(
            'Não foi possível adicionar o produto ao carrinho.'
          );
        }

      });
  }


  // =====================================================
  // FORMATAR PREÇO
  // =====================================================

  formatarPreco(
    valor: number
  ): string {

    return valor
      ? valor.toFixed(2).replace('.', ',')
      : '0,00';
  }

}