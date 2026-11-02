import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id?: number;
  nome: string;
  tipo: 'feminino' | 'masculino' | 'topbar';
  imagemUrl: string;
  ordem: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private apiUrl = 'http://localhost:3000/categorias';

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // ==============================
  // LISTAR TODAS
  // ==============================

  obterCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // ==============================
  // BUSCAR POR ID
  // ==============================

  obterCategoriaPorId(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(
      `${this.apiUrl}/${id}`
    );
  }

  // ==============================
  // CRIAR
  // ==============================

  criarCategoria(
    categoria: Categoria
  ): Observable<Categoria> {

    return this.http.post<Categoria>(
      this.apiUrl,
      categoria,
      this.getHeaders()
    );
  }

  // ==============================
  // ATUALIZAR
  // ==============================

  atualizarCategoria(
    id: number,
    categoria: Categoria
  ): Observable<Categoria> {

    return this.http.put<Categoria>(
      `${this.apiUrl}/${id}`,
      categoria,
      this.getHeaders()
    );
  }

  // ==============================
  // EXCLUIR
  // ==============================

  deletarCategoria(id: number): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    );
  }
}