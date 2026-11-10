import { Router } from '@angular/router';
import { LojaService } from '../../core/services/loja.service';


import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css'
})
export class SidePanel implements OnChanges {


  private readonly API = environment.apiUrl;


  @Input() isOpen = false;
  @Input() mode: 'cart' | 'favorites' = 'cart';

  @Output() close = new EventEmitter<void>();

  @Output() itemRemovido = new EventEmitter<{
    produtoId: number,
    mode: 'cart' | 'favorites'
  }>();

  cartItems: any[] = [];

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private lojaService: LojaService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {

    
  // Sempre que o painel for aberto
  if (changes['isOpen'] && this.isOpen) {
    this.carregarItens();
  }

  // Se trocar entre carrinho e favoritos enquanto o painel
  // estiver aberto, busca novamente os dados.
  if (
    changes['mode'] &&
    this.isOpen
  ) {
    this.carregarItens();
  }

  // Quando fechar, limpa apenas a representação visual.
  if (
    changes['isOpen'] &&
    !this.isOpen
  ) {
    this.cartItems = [];
  }

}

  abrirDetalhes(item: any): void {
  if (!item?.id) {
    console.warn('Produto sem ID:', item);
    return;
  }

  // Fecha o painel antes de navegar
  this.fecharPainel();

  // Vai para a página de detalhes usando o ID real do produto
  this.router.navigate(['/produto', item.id]);
}

  carregarItens(): void {

    const token = localStorage.getItem('token');

    if (!token) {
      this.cartItems = [];
      this.cdRef.detectChanges();
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    const urlItens =
  this.mode === 'cart'
    ? `${this.API}/carrinho`
    : `${this.API}/favoritos`;

    /*
     * Busca:
     *
     * 1. Os itens do carrinho/favoritos
     * 2. A lista REAL de produtos
     *
     * Assim conseguimos cruzar produtoId com id.
     */
    forkJoin({
      itens: this.http.get<any[]>(urlItens, { headers }),
      produtos: this.http.get<any[]>(
        `${this.API}/produtos`,
        { headers }
      )
    }).subscribe({

      next: ({ itens, produtos }) => {

        if (!Array.isArray(itens) || !Array.isArray(produtos)) {
          console.error('Resposta inesperada da API.');
          this.cartItems = [];
          this.cdRef.detectChanges();
          return;
        }

        this.cartItems = itens.map((itemDb: any) => {

          /*
           * Comparamos os IDs como Number para evitar problema
           * caso um venha como string e outro como número.
           */
          const produtoInfo = produtos.find(
            (produto: any) =>
              Number(produto.id) === Number(itemDb.produtoId)
          );

          /*
           * Se realmente não encontrar o produto no banco,
           * mostramos um fallback.
           *
           * Mas agora isso só acontecerá se o produto realmente
           * não existir mais na API.
           */
          if (!produtoInfo) {

            console.warn(
              `Produto ${itemDb.produtoId} não encontrado na API.`
            );

            return {
              idDb: itemDb.id,
              id: Number(itemDb.produtoId),
              name: 'Produto Indisponível',
              size: itemDb.tamanho || 'Único',
              price: 0,
              quantity: itemDb.quantidade || 1,
              image: '/cinza-quadrado.png',
              swipeOffset: 0,
              isSwiping: false
            };
          }

          /*
           * Tratamento da imagem.
           *
           * Aceita os formatos que seu ProductDetails já utiliza:
           * imagemUrl
           * imagem
           * imagens[]
           */
          let imagem = '/placeholder.png';

          if (produtoInfo.imagemUrl) {

            imagem = produtoInfo.imagemUrl;

          } else if (produtoInfo.imagem) {

            imagem = produtoInfo.imagem;

          } else if (
            Array.isArray(produtoInfo.imagens) &&
            produtoInfo.imagens.length > 0
          ) {

            imagem = produtoInfo.imagens[0];

          }

          /*
           * Montamos o objeto que o HTML do SidePanel espera.
           */
          return {

            idDb: itemDb.id,

            id: Number(produtoInfo.id),

            name:
              produtoInfo.nome ||
              produtoInfo.name ||
              produtoInfo.titulo ||
              'Produto sem nome',

            size:
              itemDb.tamanho ||
              'Único',

            price:
              Number(
                produtoInfo.preco ??
                produtoInfo.valor ??
                produtoInfo.price ??
                0
              ),

            quantity:
              Number(itemDb.quantidade ?? 1),

            image: imagem,

            swipeOffset: 0,

            isSwiping: false

          };

        });

        console.log('Itens carregados no painel:', this.cartItems);

        this.cdRef.detectChanges();
      },

      error: (err) => {

        console.error(
          'Erro ao buscar carrinho/favoritos e produtos:',
          err
        );

        this.cartItems = [];

        this.cdRef.detectChanges();
      }

    });
  }


  finalizarCompra(): void {

  if (!this.cartItems.length) {
    return;
  }

  this.isOpen = false;

  this.close.emit();

  this.router.navigate(['/checkout']);
}



  fecharPainel(): void {

    this.cartItems = [];

    this.close.emit();

  }

  aumentarQtd(item: any): void {

    item.quantity++;

  }

  diminuirQtd(item: any): void {

    if (item.quantity > 1) {
      item.quantity--;
    }

  }

  removerItem(item: any): void {
  const token = localStorage.getItem('token');

  if (!token) return;

  const produtoIdRemovido = Number(item.id);

  /*
   * Remove imediatamente da tela.
   */
  this.cartItems = this.cartItems.filter(
    i => i.idDb !== item.idDb
  );

  this.cdRef.detectChanges();

  /*
   * Avisa o componente pai.
   */
  this.itemRemovido.emit({
    produtoId: produtoIdRemovido,
    mode: this.mode
  });

  const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`);

  const url =
    this.mode === 'cart'
      ? `${this.API}/carrinho/${item.idDb}`
      : `${this.API}/favoritos/${item.idDb}`;

  this.http.delete(url, { headers }).subscribe({

    next: () => {

      console.log(
        'Item excluído com sucesso do banco!'
      );

      /*
       * IMPORTANTE:
       * avisa todos os componentes da loja
       * para sincronizarem novamente os favoritos.
       */
      this.lojaService.notificarAtualizacao();
    },

    error: (err) => {

      console.error(
        'Erro ao excluir item do servidor:',
        err
      );

      /*
       * Se deu erro, recupera os itens.
       */
      this.carregarItens();
    }

  });
}

  get valorTotalFormatado(): string {

    const total = this.cartItems.reduce(
      (acc, item) =>
        acc + (Number(item.price) * Number(item.quantity)),
      0
    );

    return total
      .toFixed(2)
      .replace('.', ',');

  }

  formatarPreco(valor: number): string {

    return Number(valor || 0)
      .toFixed(2)
      .replace('.', ',');

  }

  // =====================================================
  // SWIPE
  // =====================================================

  startX = 0;

  onTouchStart(
    event: TouchEvent,
    item: any
  ): void {

    this.startX = event.touches[0].clientX;

    item.isSwiping = true;

    this.cartItems.forEach(i => {

      if (i.id !== item.id) {
        i.swipeOffset = 0;
      }

    });

  }

  onTouchMove(
    event: TouchEvent,
    item: any
  ): void {

    if (!item.isSwiping) return;

    const currentX = event.touches[0].clientX;

    const diff = currentX - this.startX;

    if (diff < 0) {

      item.swipeOffset =
        Math.max(diff, -80);

    } else {

      item.swipeOffset = 0;

    }

  }

  onTouchEnd(item: any): void {

    item.isSwiping = false;

    if (
      item.swipeOffset &&
      item.swipeOffset < -40
    ) {

      item.swipeOffset = -80;

    } else {

      item.swipeOffset = 0;

    }

  }

}