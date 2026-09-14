import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // ⬅️ Importação que lê a URL
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
  
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  // Variável que vai guardar o produto que deve aparecer na tela
  produto: any;
  
  imagemPrincipal = '';
  tamanhos = ['P', 'M', 'G', 'GG'];
  tamanhoSelecionado = '';
  quantidadeSelecionada = 1;

  // Mini "Banco de Dados" simulado para testarmos
  bancoDeDadosSimulado = [
    {
      id: 1, // ID TEM QUE BATER COM O DA VITRINE
      nome: 'Conjunto Azul',
      categoria: 'Conjuntos',
      vendedor: 'Thamy Weissinger',
      preco: 105.00,
      estoque: 15,
      descricao: 'Lindo conjunto azul para seus treinos.',
      imagens: ['/produto1.png', '/image0.png', '/image1.png', '/image2.png']
    },
    {
      id: 2,
      nome: 'Camiseta Poliamida',
      categoria: 'Feminino',
      vendedor: 'Thamy Weissinger',
      preco: 79.90,
      estoque: 5,
      descricao: 'Camiseta leve e respirável para o dia a dia.',
      imagens: ['/produto1.png', '/image0.png', '/image1.png', '/image2.png']
    },
    {
      id: 21,
      nome: 'teste de la teste',
      categoria: 'Feminino',
      vendedor: 'Thamy Weissinger',
      preco: 79.90,
      estoque: 5,
      descricao: 'Camiseta leve e respirável para o dia a dia.',
      imagens: ['/produto1.png', '/image0.png', '/image1.png', '/image2.png']
    }
  ];

  verificarLogin(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para adicionar itens!');
      // Dica: Futuramente, você pode fazer abrir o modal de login aqui direto!
      return false;
    }
    return true;
  }

  favoritar() {
    if (!this.verificarLogin()) return; // Barra se não tiver logado

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Supondo que você crie essa rota no Node.js
    this.http.post('http://localhost:3000/favoritos', { produtoId: this.produto.id }, { headers })
      .subscribe({
        next: () => alert('Produto adicionado aos favoritos! 🖤'),
        error: (err) => alert('Erro ao favoritar.')
      });
  }



  // O ngOnInit roda automaticamente assim que a página abre
  ngOnInit() {
    // 1. Lê o ID que está lá na URL (ex: seu-site.com/produto/2)
    const idDaUrl = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Procura no nosso "banco de dados" qual produto tem esse ID
    const produtoEncontrado = this.bancoDeDadosSimulado.find(p => p.id === idDaUrl);

    // 3. Se encontrar, coloca ele na tela. Se não, mostra o primeiro por padrão.
    if (produtoEncontrado) {
      this.produto = produtoEncontrado;
    } else {
      this.produto = this.bancoDeDadosSimulado[0]; 
    }

    // 4. Define a foto principal
    this.imagemPrincipal = this.produto.imagens[0];
  }

  // --- Funções Interativas ---
  trocarImagem(img: string) { this.imagemPrincipal = img; }
  selecionarTamanho(tamanho: string) { this.tamanhoSelecionado = tamanho; }
  
  aumentarQuantidade() {
    if (this.quantidadeSelecionada < this.produto.estoque) {
      this.quantidadeSelecionada++;
    }
  }

  diminuirQuantidade() {
    if (this.quantidadeSelecionada > 1) {
      this.quantidadeSelecionada--;
    }
  }

  comprar() {
    if (!this.verificarLogin()) return; // Barra se não tiver logado
    
    if (!this.tamanhoSelecionado) {
      alert('Por favor, selecione um tamanho antes de comprar!');
      return;
    }

    if (this.produto.estoque >= this.quantidadeSelecionada) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const payload = {
        produtoId: this.produto.id,
        tamanho: this.tamanhoSelecionado,
        quantidade: this.quantidadeSelecionada
      };

      // Supondo que você crie essa rota no Node.js
      this.http.post('http://localhost:3000/carrinho', payload, { headers })
        .subscribe({
          next: () => {
            alert(`Adicionado ao carrinho!`);
            this.quantidadeSelecionada = 1; 
            this.tamanhoSelecionado = '';
          },
          error: (err) => alert('Erro ao adicionar ao carrinho.')
        });
    }
  }
}