import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonAutocompleteComponent } from './taxon-autocomplete.component';

describe('TaxonAutocompleteComponent', () => {
  let component: TaxonAutocompleteComponent;
  let fixture: ComponentFixture<TaxonAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
