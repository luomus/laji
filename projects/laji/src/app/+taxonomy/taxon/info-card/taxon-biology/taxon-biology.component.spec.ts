import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonBiologyComponent } from './taxon-biology.component';

describe('TaxonBiologyComponent', () => {
  let component: TaxonBiologyComponent;
  let fixture: ComponentFixture<TaxonBiologyComponent>;

  beforeEach(waitForAsync(() => {
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
