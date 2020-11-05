import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesBrowseObservationsComponent } from './species-browse-observations.component';

describe('SpeciesBrowseObservationsComponent', () => {
  let component: SpeciesBrowseObservationsComponent;
  let fixture: ComponentFixture<SpeciesBrowseObservationsComponent>;

  beforeEach(async(() => {
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
