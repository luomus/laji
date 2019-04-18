import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonDescriptionComponent } from './taxon-description.component';

describe('TaxonDescriptionComponent', () => {
  let component: TaxonDescriptionComponent;
  let fixture: ComponentFixture<TaxonDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
