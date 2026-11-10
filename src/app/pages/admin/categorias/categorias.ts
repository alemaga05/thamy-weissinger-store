import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

interface Categoria {
  id?: number;
  nome: string;
  tipo: 'feminino' | 'masculino' | 'topbar';
  imagemUrl: string;
  ordem: number;
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {

  private readonly apiUrl = `${environment.apiUrl}/categorias`;

  categorias: Categoria[] = [];

  carregando = false;

  exibirModal = false;

  editando = false;

  idCategoriaEmEdicao: number | null = null;

  abaCategoria: 'feminino' | 'masculino' | 'topbar' = 'feminino';

  formCategoria: Categoria = {
    nome: '',
    tipo: 'feminino',
    imagemUrl: '',
    ordem: 1
  };

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  // =========================================================
  // HEADERS
  // =========================================================

  private getHeaders(): { headers: HttpHeaders } {

    const token = localStorage.getItem('token') || '';

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // =========================================================
  // CARREGAR CATEGORIAS
  // =========================================================

  carregarCategorias(): void {

    this.carregando = true;

    this.http.get<Categoria[]>(this.apiUrl).subscribe({

      next: (dados) => {

        this.categorias = dados.sort(
          (a, b) => a.ordem - b.ordem
        );

        this.carregando = false;

      },

      error: (err) => {

        console.error(
          'Erro ao carregar categorias:',
          err
        );

        this.categorias = [];

        this.carregando = false;

        alert(
          'Não foi possível carregar as categorias.'
        );
      }
    });
  }

  // =========================================================
  // FILTRAR CATEGORIAS
  // =========================================================

  get categoriasFiltradas(): Categoria[] {

    return this.categorias
      .filter(
        categoria =>
          categoria.tipo === this.abaCategoria
      )
      .sort(
        (a, b) => a.ordem - b.ordem
      );
  }

  // =========================================================
  // TROCAR ABA
  // =========================================================

  mudarAba(
    aba: 'feminino' | 'masculino' | 'topbar'
  ): void {

    this.abaCategoria = aba;
  }

  // =========================================================
  // ABRIR MODAL NOVA CATEGORIA
  // =========================================================

  abrirModalNova(): void {

    this.editando = false;

    this.idCategoriaEmEdicao = null;

    const categoriasDaAba =
      this.categorias.filter(
        categoria =>
          categoria.tipo === this.abaCategoria
      );

    const proximaOrdem =
      categoriasDaAba.length > 0
        ? Math.max(
            ...categoriasDaAba.map(
              categoria => categoria.ordem
            )
          ) + 1
        : 1;

    this.formCategoria = {

      nome: '',

      tipo: this.abaCategoria,

      imagemUrl: '',

      ordem: proximaOrdem

    };

    this.exibirModal = true;
  }

  // =========================================================
  // ABRIR MODAL EDITAR
  // =========================================================

  abrirModalEditar(
    categoria: Categoria
  ): void {

    this.editando = true;

    this.idCategoriaEmEdicao =
      categoria.id || null;

    this.formCategoria = {
      ...categoria
    };

    this.exibirModal = true;
  }

  // =========================================================
  // FECHAR MODAL
  // =========================================================

  fecharModal(): void {

    this.exibirModal = false;

    this.editando = false;

    this.idCategoriaEmEdicao = null;
  }

  // =========================================================
  // SALVAR
  // =========================================================

  salvarCategoria(): void {

    if (
      !this.formCategoria.nome ||
      !this.formCategoria.nome.trim()
    ) {

      alert(
        'Digite o nome da categoria.'
      );

      return;
    }

    // -------------------------------------------------------
    // EDITAR
    // -------------------------------------------------------

    if (
      this.editando &&
      this.idCategoriaEmEdicao
    ) {

      const id =
        this.idCategoriaEmEdicao;

      const categoriaAnterior =
        this.categorias.find(
          categoria =>
            categoria.id === id
        );

      this.fecharModal();

      this.http.put<Categoria>(
        `${this.apiUrl}/${id}`,
        this.formCategoria,
        this.getHeaders()
      ).subscribe({

        next: (categoriaAtualizada) => {

          const index =
            this.categorias.findIndex(
              categoria =>
                categoria.id === id
            );

          if (index !== -1) {

            this.categorias[index] =
              categoriaAtualizada;
          }

          this.categorias = [
            ...this.categorias
          ];
        },

        error: (err) => {

          if (categoriaAnterior) {

            const index =
              this.categorias.findIndex(
                categoria =>
                  categoria.id === id
              );

            if (index !== -1) {

              this.categorias[index] =
                categoriaAnterior;

              this.categorias = [
                ...this.categorias
              ];
            }
          }

          console.error(
            'Erro ao atualizar categoria:',
            err
          );

          alert(
            'Erro ao atualizar categoria: ' +
            (
              err.error?.mensagem ||
              'Falha na requisição'
            )
          );
        }
      });

      return;
    }

    // -------------------------------------------------------
    // CRIAR
    // -------------------------------------------------------

    const categoriaParaCriar = {
      ...this.formCategoria
    };

    this.fecharModal();

    this.http.post<Categoria>(
      this.apiUrl,
      categoriaParaCriar,
      this.getHeaders()
    ).subscribe({

      next: (novaCategoria) => {

        this.categorias = [
          ...this.categorias,
          novaCategoria
        ].sort(
          (a, b) => a.ordem - b.ordem
        );
      },

      error: (err) => {

        console.error(
          'Erro ao criar categoria:',
          err
        );

        alert(
          'Erro ao criar categoria: ' +
          (
            err.error?.mensagem ||
            'Falha na requisição'
          )
        );
      }
    });
  }

  // =========================================================
  // EXCLUIR
  // =========================================================

  excluirCategoria(
    id: number | undefined
  ): void {

    if (!id) {
      return;
    }

    const categoria =
      this.categorias.find(
        item => item.id === id
      );

    if (!categoria) {
      return;
    }

    const confirmou =
      confirm(
        `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`
      );

    if (!confirmou) {
      return;
    }

    const categoriasAnteriores =
      [...this.categorias];

    // Remove imediatamente da tela

    this.categorias =
      this.categorias.filter(
        item => item.id !== id
      );

    this.http.delete(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    ).subscribe({

      next: () => {

        console.log(
          'Categoria excluída com sucesso.'
        );
      },

      error: (err) => {

        // Restaura se der erro

        this.categorias =
          categoriasAnteriores;

        console.error(
          'Erro ao excluir categoria:',
          err
        );

        alert(
          'Erro ao excluir categoria: ' +
          (
            err.error?.mensagem ||
            'Falha na requisição'
          )
        );
      }
    });
  }

  // =========================================================
  // NOME DA ABA
  // =========================================================

  get nomeAbaAtual(): string {

    if (this.abaCategoria === 'feminino') {
      return 'Categorias Femininas';
    }

    if (this.abaCategoria === 'masculino') {
      return 'Categorias Masculinas';
    }

    return 'Categorias do Topbar';
  }

}