import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesFormComponent } from './species-form.component';

describe('SpeciesFormComponent', () => {
  let component: SpeciesFormComponent;
  let fixture: ComponentFixture<SpeciesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
