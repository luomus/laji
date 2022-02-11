import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteSelectionMapComponent } from './site-selection-map.component';

describe('SiteSelectionMapComponent', () => {
  let component: SiteSelectionMapComponent;
  let fixture: ComponentFixture<SiteSelectionMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteSelectionMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteSelectionMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
