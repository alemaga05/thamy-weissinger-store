import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class Category implements OnInit {
  categoriaAtual: string = '';
  produtosFiltrados: any[] = [];

  // Banco de dados simulado (Futuramente virá do painel da Thamy)
  todosOsProdutos = [
    { id: 1, nome: 'Conjunto com Top e Calça', preco: 105.00, categoria: 'feminino', imagem: '/produto1.png' },
    { id: 2, nome: 'Legging Alta Compressão', preco: 89.90, categoria: 'feminino', imagem: '/produto2.png' },
    { id: 3, nome: 'Bermuda Térmica', preco: 65.00, categoria: 'masculino', imagem: '/produto3.png' },
    { id: 4, nome: 'Camiseta Dry Fit', preco: 55.00, categoria: 'masculino', imagem: '/produto4.png' },
    { id: 5, nome: 'Garrafa Térmica 1L', preco: 45.00, categoria: 'acessorios', imagem: '/produto5.png' },
    { id: 6, nome: 'Boné Esportivo', preco: 35.00, categoria: 'acessorios', imagem: '/produto6.png' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Fica "escutando" as mudanças na URL
    this.route.paramMap.subscribe(params => {
      // Pega o nome da categoria na URL (ex: "masculino")
      this.categoriaAtual = params.get('nome') || '';
      this.filtrarProdutos();
    });
  }

  filtrarProdutos() {
    // Filtra a lista para mostrar só os produtos da categoria atual
    this.produtosFiltrados = this.todosOsProdutos.filter(
      produto => produto.categoria === this.categoriaAtual.toLowerCase()
    );
  }

  formatarPreco(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
  }
}