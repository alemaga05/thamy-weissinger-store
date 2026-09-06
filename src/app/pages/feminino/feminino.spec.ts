import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Feminino } from './feminino';

describe('Feminino', () => {
  let component: Feminino;
  let fixture: ComponentFixture<Feminino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feminino],
    }).compileComponents();

    fixture = TestBed.createComponent(Feminino);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
