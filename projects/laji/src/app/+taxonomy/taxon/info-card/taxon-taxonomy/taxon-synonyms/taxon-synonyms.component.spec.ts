import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonSynonymsComponent } from './taxon-synonyms.component';

describe('TaxonSynonymsComponent', () => {
  let component: TaxonSynonymsComponent;
  let fixture: ComponentFixture<TaxonSynonymsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonSynonymsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonSynonymsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
