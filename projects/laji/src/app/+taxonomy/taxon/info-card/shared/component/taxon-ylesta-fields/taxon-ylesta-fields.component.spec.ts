import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonYlestaFieldsComponent } from './taxon-ylesta-fields.component';

describe('TaxonYlestaFieldsComponent', () => {
  let component: TaxonYlestaFieldsComponent;
  let fixture: ComponentFixture<TaxonYlestaFieldsComponent>;

  beforeEach(waitForAsync(() => {
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
