import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonObservationsComponent } from './taxon-observations.component';

describe('TaxonObservationsComponent', () => {
  let component: TaxonObservationsComponent;
  let fixture: ComponentFixture<TaxonObservationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonObservationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonObservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
