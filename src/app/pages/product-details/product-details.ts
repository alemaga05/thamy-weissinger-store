import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // ⬅️ Importação que lê a URL

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
  
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
    }
  ];

  // O Constructor "injeta" as ferramentas do Angular na nossa página
  constructor(private route: ActivatedRoute) {}

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
    if (!this.tamanhoSelecionado) {
      alert('Por favor, selecione um tamanho antes de comprar!');
      return;
    }
    if (this.produto.estoque >= this.quantidadeSelecionada) {
      this.produto.estoque -= this.quantidadeSelecionada;
      alert(`Você comprou ${this.quantidadeSelecionada} unidade(s) do tamanho ${this.tamanhoSelecionado}!`);
      this.quantidadeSelecionada = 1; 
      this.tamanhoSelecionado = '';
    }
  }
}