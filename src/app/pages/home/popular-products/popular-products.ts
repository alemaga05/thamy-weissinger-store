
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';

import {
  Produto,
  ProdutoService
} from '../../../core/services/produto.service';

interface FavoritoApi {
  id: number;
  produtoId: number;
}

@Component({
  selector: 'app-popular-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './popular-products.html',
  styleUrl: './popular-products.css'
})
export class PopularProducts implements OnInit, OnDestroy {
  private readonly API = 'http://localhost:3000';
  private subscriptions = new Subscription();

  products: Produto[] = [];
  carregando = true;
  carregandoFavoritos = false;

  // Guarda o ID do registro de favorito para permitir removê-lo.
  favoritosIds = new Set<number>();
  private favoritosPorProduto = new Map<number, number>();
  processandoFavoritos = new Set<number>();

  constructor(
    private produtoService: ProdutoService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarFavoritos();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private criarHeaders(): HttpHeaders | null {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  carregarProdutos(): void {
    this.carregando = true;

    this.subscriptions.add(
      this.produtoService.obterProdutos().subscribe({
        next: (dados: Produto[]) => {
          this.products = dados.filter(
            produto =>
              produto.popular === true ||
              (produto.popular as unknown) === 1 ||
              (produto.popular as unknown) === 'true'
          );

          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: erro => {
          console.error('Erro ao carregar produtos populares:', erro);
          this.products = [];
          this.carregando = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  carregarFavoritos(): void {
    const headers = this.criarHeaders();

    this.favoritosIds.clear();
    this.favoritosPorProduto.clear();

    if (!headers) {
      this.cdr.detectChanges();
      return;
    }

    this.carregandoFavoritos = true;

    this.subscriptions.add(
      this.http.get<FavoritoApi[]>(
        `${this.API}/favoritos`,
        { headers }
      ).subscribe({
        next: favoritos => {
          for (const favorito of favoritos) {
            const produtoId = Number(favorito.produtoId);

            this.favoritosIds.add(produtoId);
            this.favoritosPorProduto.set(
              produtoId,
              Number(favorito.id)
            );
          }

          this.carregandoFavoritos = false;
          this.cdr.detectChanges();
        },
        error: erro => {
          console.error('Erro ao carregar favoritos:', erro);
          this.carregandoFavoritos = false;

          if (erro.status === 401 || erro.status === 403) {
            this.favoritosIds.clear();
            this.favoritosPorProduto.clear();
          }

          this.cdr.detectChanges();
        }
      })
    );
  }

  estaFavoritado(produtoId: number | undefined): boolean {
    return produtoId != null && this.favoritosIds.has(Number(produtoId));
  }

 
alternarFavorito(event: MouseEvent, produto: Produto): void {
  event.preventDefault();
  event.stopPropagation();

  const produtoId = Number(produto.id);

  if (!produtoId || this.processandoFavoritos.has(produtoId)) {
    return;
  }

  const headers = this.criarHeaders();

  if (!headers) {
    alert('Entre na sua conta para adicionar produtos aos favoritos.');
    return;
  }

  const estavaFavoritado = this.favoritosIds.has(produtoId);
  const favoritoId = this.favoritosPorProduto.get(produtoId);

  this.processandoFavoritos.add(produtoId);

  // Atualiza a interface imediatamente, sem esperar a API.
  if (estavaFavoritado) {
    this.favoritosIds.delete(produtoId);
    this.favoritosPorProduto.delete(produtoId);
  } else {
    this.favoritosIds.add(produtoId);
  }

  this.cdr.detectChanges();

  const restaurarEstadoAnterior = () => {
    if (estavaFavoritado) {
      this.favoritosIds.add(produtoId);

      if (favoritoId != null) {
        this.favoritosPorProduto.set(produtoId, favoritoId);
      }
    } else {
      this.favoritosIds.delete(produtoId);
      this.favoritosPorProduto.delete(produtoId);
    }

    this.finalizarAcaoFavorito(produtoId);
  };

  if (estavaFavoritado) {
    if (favoritoId == null) {
      this.carregarFavoritos();
      this.finalizarAcaoFavorito(produtoId);
      return;
    }

    this.subscriptions.add(
      this.http.delete(
        `${this.API}/favoritos/${favoritoId}`,
        { headers }
      ).subscribe({
        next: () => {
          this.finalizarAcaoFavorito(produtoId);
        },
        error: erro => {
          console.error('Erro ao remover favorito:', erro);
          restaurarEstadoAnterior();
          alert('Não foi possível remover o favorito. Tente novamente.');
        }
      })
    );

    return;
  }

  this.subscriptions.add(
    this.http.post<FavoritoApi>(
      `${this.API}/favoritos`,
      { produtoId },
      { headers }
    ).subscribe({
      next: favorito => {
        if (favorito?.id != null) {
          this.favoritosPorProduto.set(
            produtoId,
            Number(favorito.id)
          );
        }

        this.finalizarAcaoFavorito(produtoId);
      },
      error: erro => {
        console.error('Erro ao adicionar favorito:', erro);
        restaurarEstadoAnterior();

        alert(
          erro.status === 401 || erro.status === 403
            ? 'Sua sessão expirou. Entre novamente na sua conta.'
            : 'Não foi possível adicionar o favorito. Tente novamente.'
        );
      }
    })
  );
}

  private finalizarAcaoFavorito(produtoId: number): void {
    this.processandoFavoritos.delete(produtoId);
    this.cdr.detectChanges();
  }

  estaProcessandoFavorito(produtoId: number | undefined): boolean {
  return produtoId != null &&
    this.processandoFavoritos.has(Number(produtoId));
}
}