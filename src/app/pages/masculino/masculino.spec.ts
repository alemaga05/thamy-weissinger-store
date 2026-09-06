import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Masculino } from './masculino';

describe('Masculino', () => {
  let component: Masculino;
  let fixture: ComponentFixture<Masculino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Masculino],
    }).compileComponents();

    fixture = TestBed.createComponent(Masculino);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
