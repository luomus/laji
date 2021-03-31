import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpeciesBrowseObservationsComponent } from './species-browse-observations.component';

describe('SpeciesBrowseObservationsComponent', () => {
  let component: SpeciesBrowseObservationsComponent;
  let fixture: ComponentFixture<SpeciesBrowseObservationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesBrowseObservationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesBrowseObservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
