import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerCarousel } from './banner-carousel';

describe('BannerCarousel', () => {
  let component: BannerCarousel;
  let fixture: ComponentFixture<BannerCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerCarousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
