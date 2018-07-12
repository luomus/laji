import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesListOptionsModalComponent } from './species-list-options-modal.component';

describe('SpeciesListOptionsModalComponent', () => {
  let component: SpeciesListOptionsModalComponent;
  let fixture: ComponentFixture<SpeciesListOptionsModalComponent>;

  beforeEach(async(() => {
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
