import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObservationEffectiveTagsTaxonComponent } from './observation-effective-tags-taxon.component';

describe('ObservationEffectiveTagsTaxonComponent', () => {
  let component: ObservationEffectiveTagsTaxonComponent;
  let fixture: ComponentFixture<ObservationEffectiveTagsTaxonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationEffectiveTagsTaxonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationEffectiveTagsTaxonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
