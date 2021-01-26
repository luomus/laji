import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcSpeciesListComponent } from './wbc-species-list.component';

describe('WbcSpeciesListComponent', () => {
  let component: WbcSpeciesListComponent;
  let fixture: ComponentFixture<WbcSpeciesListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
