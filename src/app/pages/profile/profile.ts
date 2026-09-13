import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  abaAtiva: 'pedidos' | 'dados' | 'enderecos' = 'dados';
  isLoggedIn = false;

  editandoDados = false;
  editandoEndereco = false;
  enderecoAtual: any = {};

  usuario = {
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: ''
  };

  // Avisando o TypeScript que são listas (any[]) para não dar erro!
  pedidos: any[] = [];
  enderecos: any[] = [
    { id: 1, rua: 'Rua afonso Cunha, 31', bairro: 'Jardim de Abril', cidade: 'São Paulo, SP, 0539-200', pais: 'Brasil', principal: true }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarPerfil();
  }

  carregarPerfil() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoggedIn = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get('http://localhost:3000/perfil', { headers })
      .subscribe({
        next: (dadosDoBanco: any) => {
          this.isLoggedIn = true;
          this.usuario.nome = dadosDoBanco.name;
          this.usuario.email = dadosDoBanco.email;
          this.usuario.telefone = dadosDoBanco.telefone || 'Não cadastrado';
          this.usuario.dataNascimento = dadosDoBanco.dataNascimento || 'Não cadastrada';
        },
        error: (erro) => {
          console.error('Erro de autenticação', erro);
          this.sairDaConta();
        }
      });
  }

  sairDaConta() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    window.location.href = '/'; // Volta pra home
  }

  mudarAba(aba: 'pedidos' | 'dados' | 'enderecos') {
    this.abaAtiva = aba;
    this.editandoDados = false;
    this.editandoEndereco = false;
  }

  toggleEditarDados() { this.editandoDados = !this.editandoDados; }
  salvarDados() { this.editandoDados = false; }
  
  novoEndereco() {
    this.enderecoAtual = { id: Date.now(), principal: false };
    this.editandoEndereco = true;
  }
  editarEndereco(end: any) {
    this.enderecoAtual = { ...end };
    this.editandoEndereco = true;
  }
  excluirEndereco(id: number) { this.enderecos = this.enderecos.filter(e => e.id !== id); }
  salvarEndereco() {
    const index = this.enderecos.findIndex(e => e.id === this.enderecoAtual.id);
    if (index > -1) this.enderecos[index] = this.enderecoAtual;
    else this.enderecos.push(this.enderecoAtual);
    this.editandoEndereco = false;
  }
  cancelarEdicaoEndereco() { this.editandoEndereco = false; }
}