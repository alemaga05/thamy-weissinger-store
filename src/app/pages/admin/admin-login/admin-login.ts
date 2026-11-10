import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  private readonly API = environment.apiUrl;

  email = '';
  senha = '';
  mensagemErro = '';
  carregando = false;

  constructor(private http: HttpClient, private router: Router) {}

  fazerLoginAdmin() {
    if (!this.email || !this.senha) {
      this.mensagemErro = 'Por favor, preencha todos os campos.';
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';

    const payload = {
      email: this.email,
      password: this.senha
    };


    this.http.post<any>(`${this.API}/login`, payload).subscribe({
      next: (res) => {
        this.carregando = false;

        if (res.user && res.user.role === 'admin') {
          alert('Login autorizado! Redirecionando...'); // ⬅️ ALERTA NA TELA
          localStorage.setItem('token', res.token);
          localStorage.setItem('user_role', res.user.role);
          localStorage.setItem('user_nome', res.user.name || res.user.nome);
          this.router.navigate(['/admin/dashboard']);
        } else {
          alert('Acesso negado: Você não é admin!');
          this.mensagemErro = 'Acesso negado! Esta conta não possui privilégios de administrador.';
        }
      },
      error: (err) => {
        console.error('Front-end: DEU ERRO NA REQUISIÇÃO!', err); // ⬅️ RASTREADOR FRONT 3
        this.carregando = false;
        if (err.status === 401) {
          this.mensagemErro = 'E-mail ou senha incorretos!';
        } else {
          this.mensagemErro = 'Erro ao conectar com o servidor. Tente novamente.';
        }
      }
    });
}
}