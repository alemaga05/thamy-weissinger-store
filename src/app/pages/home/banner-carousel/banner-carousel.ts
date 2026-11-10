
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

interface Banner {
  id: number;
  titulo: string;
  imagemUrl: string;
  link?: string | null;
  ativo: boolean;
  ordem: number;
}

interface Slide {
  id: number;
  url: string;
  alt: string;
  link: string | null;
}

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-carousel.html',
  styleUrl: './banner-carousel.css'
})
export class BannerCarousel implements OnInit, OnDestroy {
  private readonly apiUrl = environment.apiUrl;

  slides: Slide[] = [];
  currentIndex = 0;

  autoPlayInterval: ReturnType<typeof setInterval> | null = null;

  touchStartX = 0;
  touchEndX = 0;

  carregando = true;
  erro = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarBanners();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  carregarBanners(): void {
    this.carregando = false;
    this.erro = false;
    this.prepararImagens(this.slides);

    // IMPORTANTE: esta rota precisa existir no backend
    // e retornar os banners ativos sem exigir acesso administrativo.
    this.http.get<Banner[]>(`${this.apiUrl}/banners`).subscribe({
      next: (banners) => {
        this.slides = (Array.isArray(banners) ? banners : [])
          .filter(banner => banner.ativo && !!banner.imagemUrl)
          .sort((a, b) => a.ordem - b.ordem)
          .map(banner => ({
            id: banner.id,
            url: banner.imagemUrl,
            alt: banner.titulo || 'Banner Thamy Fitwear',
            link: banner.link || null
          }));

        this.currentIndex = 0;
        this.carregando = false;
        this.startAutoPlay();
      },
      error: (erro) => {
        console.error('Erro ao carregar banners:', erro);
        this.slides = [];
        this.carregando = false;
        this.erro = true;
        this.stopAutoPlay();
      }
    });
  }

  startAutoPlay(): void {
    this.stopAutoPlay();

    if (this.slides.length <= 1) {
      return;
    }

    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval !== null) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  nextSlide(): void {
    if (this.slides.length <= 1) return;

    this.currentIndex =
      (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    if (this.slides.length <= 1) return;

    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) %
      this.slides.length;
  }

  irParaSlide(index: number): void {
    if (index < 0 || index >= this.slides.length) return;
    this.currentIndex = index;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;

    const distancia = this.touchEndX - this.touchStartX;

    if (distancia < -50) {
      this.nextSlide();
    } else if (distancia > 50) {
      this.prevSlide();
    }
  }

  private prepararImagens(slides: Slide[]): void {
    slides.forEach((slide, index) => {
      const imagem = new Image();

      if (index === 0) {
        imagem.fetchPriority = 'high';
      }

      imagem.decoding = 'async';
      imagem.src = slide.url;
    });
  }

}