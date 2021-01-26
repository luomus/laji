import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcSpeciesComponent } from './wbc-species.component';

describe('WbcSpeciesComponent', () => {
  let component: WbcSpeciesComponent;
  let fixture: ComponentFixture<WbcSpeciesComponent>;

  beforeEach(waitForAsync(() => {
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
