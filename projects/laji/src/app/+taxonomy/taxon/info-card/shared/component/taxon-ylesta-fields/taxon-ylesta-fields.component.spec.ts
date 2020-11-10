import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonYlestaFieldsComponent } from './taxon-ylesta-fields.component';

describe('TaxonYlestaFieldsComponent', () => {
  let component: TaxonYlestaFieldsComponent;
  let fixture: ComponentFixture<TaxonYlestaFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonYlestaFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonYlestaFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
