import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonBiologyComponent } from './taxon-biology.component';

describe('TaxonBiologyComponent', () => {
  let component: TaxonBiologyComponent;
  let fixture: ComponentFixture<TaxonBiologyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonBiologyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonBiologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
