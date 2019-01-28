import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonNamesComponent } from './taxon-names.component';

describe('TaxonNamesComponent', () => {
  let component: TaxonNamesComponent;
  let fixture: ComponentFixture<TaxonNamesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonNamesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonNamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
