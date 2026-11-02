import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LojaService {

  private atualizacaoSubject = new Subject<void>();

  atualizacao$ = this.atualizacaoSubject.asObservable();

  notificarAtualizacao(): void {
    this.atualizacaoSubject.next();
  }
}