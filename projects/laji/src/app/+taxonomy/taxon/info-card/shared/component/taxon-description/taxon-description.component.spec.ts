import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonDescriptionComponent } from './taxon-description.component';

describe('TaxonDescriptionComponent', () => {
  let component: TaxonDescriptionComponent;
  let fixture: ComponentFixture<TaxonDescriptionComponent>;

  beforeEach(waitForAsync(() => {
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
