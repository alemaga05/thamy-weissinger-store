import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModal {
  @Input() isOpen = false; 
  @Output() close = new EventEmitter();

  isLoginView = true;
  mensagemSucesso = ''; // <-- Nossa variável para a mensagem verde!

  // Dados do Cadastro
  cadastroData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Dados do Login
  loginData = {
    email: '',
    password: ''
  };

  constructor(private http: HttpClient) {}

  fecharModal() {
    this.close.emit();
    setTimeout(() => this.isLoginView = true, 300); 
  }

  alternarTela() {
    this.isLoginView = !this.isLoginView;
  }

  fazerCadastro() {
    if (this.cadastroData.password !== this.cadastroData.confirmPassword) {
      alert("As senhas não coincidem. Digite novamente!");
      return;
    }

    const payload = {
      name: this.cadastroData.name,
      email: this.cadastroData.email,
      password: this.cadastroData.password
    };

    this.http.post('http://localhost:3000/cadastro', payload)
      .subscribe({
        next: (resposta) => {
          alert("Cadastro realizado com sucesso! 🎉");
          this.alternarTela(); 
        },
        error: (erro) => {
          alert(erro.error.mensagem || "Erro ao realizar o cadastro.");
        }
      });
  }

  fazerLogin() {
    const payload = {
      email: this.loginData.email,
      password: this.loginData.password
    };

    this.http.post('http://localhost:3000/login', payload)
      .subscribe({
        next: (resposta: any) => {
          // Mostra a mensagem verde bonita
          this.mensagemSucesso = "Login efetuado com sucesso! 🎉";
          
          // Salva o token
          localStorage.setItem('token', resposta.token);
          
          // Fecha o modal depois de 2 segundos
          setTimeout(() => {
            this.fecharModal();
            this.mensagemSucesso = '';
          }, 2000);
        },
        error: (erro) => {
          alert(erro.error.mensagem || "Erro ao realizar o login.");
        }
      });
  }
}