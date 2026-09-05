import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para laços de repetição (ngFor)

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule], // Importamos os módulos comuns do Angular
  templateUrl: './banner-carousel.html',
  styleUrl: './banner-carousel.css'
})
export class BannerCarousel implements OnInit, OnDestroy {
  // 1. DADOS: Estrutura pronta para receber informações do Banco de Dados no futuro
  slides = [
    { id: 1, url: '/banner1.jpg', alt: 'Conforto, Performance e Estilo' },
    { id: 2, url: '/banner1.jpg', alt: 'Moda Fitness Feminina' },
    { id: 3, url: '/banner1.jpg', alt: 'Coleção Masculina' }
  ];

  // 2. CONTROLES: Diz qual slide está aparecendo no momento (começa no 0)
  currentIndex = 0;
  autoPlayInterval: any;

  // 3. INÍCIO: Assim que o componente carregar na tela, ligamos o motor
  ngOnInit() {
    this.startAutoPlay();
  }

  // 4. FIM: Se a pessoa mudar de página, desligamos o motor para não travar o navegador
  ngOnDestroy() {
    this.stopAutoPlay();
  }

  // --- FUNÇÕES DO CARROSSEL ---

  // Função para girar os banners automaticamente a cada 5 segundos (5000 milissegundos)
  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); 
  }

  // Função para pausar a rotação
  stopAutoPlay() {
    clearInterval(this.autoPlayInterval);
  }

  // Função do botão "Avançar"
  nextSlide() {
    // Se estiver no último slide, volta pro primeiro. Se não, avança um.
    this.currentIndex = (this.currentIndex === this.slides.length - 1) ? 0 : this.currentIndex + 1;
  }

  // Função do botão "Voltar"
  prevSlide() {
    // Se estiver no primeiro slide, vai lá pro último. Se não, volta um.
    this.currentIndex = (this.currentIndex === 0) ? this.slides.length - 1 : this.currentIndex - 1;
  }
}