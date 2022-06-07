import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonSelectComponent } from './taxon-select.component';

describe('TaxonSelectComponent', () => {
  let component: TaxonSelectComponent;
  let fixture: ComponentFixture<TaxonSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxonSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
