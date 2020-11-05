import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesComponent } from './wbc-species.component';

describe('WbcSpeciesComponent', () => {
  let component: WbcSpeciesComponent;
  let fixture: ComponentFixture<WbcSpeciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
