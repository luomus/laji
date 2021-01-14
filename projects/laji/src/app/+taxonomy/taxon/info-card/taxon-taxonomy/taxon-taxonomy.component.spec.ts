import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonTaxonomyComponent } from './taxon-taxonomy.component';

describe('TaxonTaxonomyComponent', () => {
  let component: TaxonTaxonomyComponent;
  let fixture: ComponentFixture<TaxonTaxonomyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonTaxonomyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonTaxonomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
