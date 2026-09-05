import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteFeminino } from './favorite-feminino';

describe('FavoriteFeminino', () => {
  let component: FavoriteFeminino;
  let fixture: ComponentFixture<FavoriteFeminino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteFeminino],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteFeminino);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
