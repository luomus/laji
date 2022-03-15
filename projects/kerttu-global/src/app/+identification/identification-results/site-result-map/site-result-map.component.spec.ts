import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteResultMapComponent } from './site-result-map.component';

describe('SiteResultMapComponent', () => {
  let component: SiteResultMapComponent;
  let fixture: ComponentFixture<SiteResultMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteResultMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteResultMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
