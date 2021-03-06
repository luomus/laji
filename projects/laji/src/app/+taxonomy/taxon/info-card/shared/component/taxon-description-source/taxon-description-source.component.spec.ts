import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonDescriptionSourceComponent } from './taxon-description-source.component';

describe('TaxonDescriptionSourceComponent', () => {
  let component: TaxonDescriptionSourceComponent;
  let fixture: ComponentFixture<TaxonDescriptionSourceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonDescriptionSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonDescriptionSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
