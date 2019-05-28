import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonOccurrencesComponent } from './taxon-occurrences.component';

describe('TaxonOccurrencesComponent', () => {
  let component: TaxonOccurrencesComponent;
  let fixture: ComponentFixture<TaxonOccurrencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonOccurrencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonOccurrencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
