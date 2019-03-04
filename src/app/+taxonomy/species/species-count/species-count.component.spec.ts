import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesCountComponent } from './species-count.component';

describe('SpeciesCountComponent', () => {
  let component: SpeciesCountComponent;
  let fixture: ComponentFixture<SpeciesCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
