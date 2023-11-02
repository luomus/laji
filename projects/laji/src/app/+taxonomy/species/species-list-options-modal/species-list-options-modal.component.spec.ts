import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpeciesListOptionsModalComponent } from './species-list-options-modal.component';

describe('SpeciesListOptionsModalComponent', () => {
  let component: SpeciesListOptionsModalComponent;
  let fixture: ComponentFixture<SpeciesListOptionsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesListOptionsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesListOptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
