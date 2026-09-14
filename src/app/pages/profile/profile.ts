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

  salvando = false;

  enderecoAtual: any = {};

  usuario = {
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: ''
  };

  // Avisando o TypeScript que são listas (any[]) para não dar erro!
  pedidos: any[] = [];
  enderecos: any[] = [];

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
          
          // MÁGICA AQUI: Pega os endereços que vieram do banco e joga na tela!
          this.enderecos = dadosDoBanco.enderecos || []; 
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

  // ATUALIZAR DADOS
  salvarDados() {
    // Se já estiver salvando, ignora cliques duplos
    if (this.salvando) return; 
    
    this.salvando = true; // Bloqueia o botão

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put('http://localhost:3000/perfil', this.usuario, { headers })
      .subscribe({
        next: (usuarioAtualizado: any) => {
          this.usuario.nome = usuarioAtualizado.name;
          this.usuario.telefone = usuarioAtualizado.telefone || 'Não cadastrado';
          this.usuario.dataNascimento = usuarioAtualizado.dataNascimento || 'Não cadastrada';
          
          this.editandoDados = false;
          this.salvando = false; // Libera o botão
          
          // Dica: Colocar o alert num setTimeout faz a tela fechar ANTES do alerta travar o navegador
          setTimeout(() => alert('Dados atualizados com sucesso!'), 10);
        },
        error: (erro) => {
          console.error('Erro ao atualizar dados', erro);
          this.salvando = false; // Libera o botão em caso de erro
          alert('Erro ao atualizar os dados.');
        }
      });
  }
 
  
  novoEndereco() {
    // Quando é novo, a gente NÃO manda ID. Assim sabemos que é pra criar.
    this.enderecoAtual = { principal: false };
    this.editandoEndereco = true;
  }

  editarEndereco(end: any) {
    this.enderecoAtual = { ...end };
    this.editandoEndereco = true;
  }
  
 excluirEndereco(id: number) {
    const confirmacao = confirm('Tem certeza que deseja excluir este endereço?');
    if (!confirmacao) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Dispara a requisição DELETE para o back-end
    this.http.delete(`http://localhost:3000/enderecos/${id}`, { headers })
      .subscribe({
        next: () => {
          alert('Endereço excluído com sucesso!');
          // Remove o endereço da lista da tela
          this.enderecos = this.enderecos.filter(e => e.id !== id);
        },
        error: (erro) => {
          console.error('Erro ao excluir', erro);
          alert('Erro ao excluir endereço.');
        }
      });
  }


  // SALVAR ENDEREÇO
  salvarEndereco() {
    if (this.salvando) return;
    this.salvando = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (this.enderecoAtual.id) {
      this.http.put(`http://localhost:3000/enderecos/${this.enderecoAtual.id}`, this.enderecoAtual, { headers })
        .subscribe({
          next: (endAtualizado: any) => {
            const index = this.enderecos.findIndex(e => e.id === endAtualizado.id);
            if (index > -1) this.enderecos[index] = endAtualizado;
            
            this.editandoEndereco = false;
            this.salvando = false;
            setTimeout(() => alert('Endereço atualizado com sucesso!'), 10);
          },
          error: (erro) => {
            console.error('Erro ao atualizar endereço', erro);
            this.salvando = false;
            alert('Erro ao atualizar o endereço.');
          }
        });
    } else {
      this.http.post('http://localhost:3000/enderecos', this.enderecoAtual, { headers })
        .subscribe({
          next: (novoEndereco: any) => {
            this.enderecos.push(novoEndereco);
            
            this.editandoEndereco = false;
            this.salvando = false;
            setTimeout(() => alert('Endereço salvo com sucesso!'), 10);
          },
          error: (erro) => {
            console.error('Erro ao salvar endereço', erro);
            this.salvando = false;
            alert('Erro ao salvar o endereço.');
          }
        });
    }
  }
  cancelarEdicaoEndereco() { this.editandoEndereco = false; }

  

}

