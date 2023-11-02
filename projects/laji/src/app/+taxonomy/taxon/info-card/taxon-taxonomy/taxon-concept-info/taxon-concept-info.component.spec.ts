import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonConceptInfoComponent } from './taxon-concept-info.component';

describe('TaxonConceptInfoComponent', () => {
  let component: TaxonConceptInfoComponent;
  let fixture: ComponentFixture<TaxonConceptInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonConceptInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonConceptInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
