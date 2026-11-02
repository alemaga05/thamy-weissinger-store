import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Produto {
  id?: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  subcategoria?: string;
  tamanhos?: string;
  estoque: number;
  imagemUrl?: string;
  popular?: boolean;
  criadoEm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private apiUrl = 'http://localhost:3000/produtos';

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

  // 1. Listar todos os produtos - PÚBLICO
  obterProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  // 2. Obter produto por ID - PÚBLICO
  obterProdutoPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(
      `${this.apiUrl}/${id}`
    );
  }

  // 3. Cadastrar produto - ADMIN
  criarProduto(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(
      this.apiUrl,
      produto,
      this.getHeaders()
    );
  }

  // 4. Atualizar produto - ADMIN
  atualizarProduto(
    id: number,
    produto: Produto
  ): Observable<Produto> {
    return this.http.put<Produto>(
      `${this.apiUrl}/${id}`,
      produto,
      this.getHeaders()
    );
  }

  // 5. Excluir produto - ADMIN
  deletarProduto(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      this.getHeaders()
    );
  }
}