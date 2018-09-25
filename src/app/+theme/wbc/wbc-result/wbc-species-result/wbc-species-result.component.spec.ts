import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesResultComponent } from './wbc-species-result.component';

describe('WbcSpeciesResultComponent', () => {
  let component: WbcSpeciesResultComponent;
  let fixture: ComponentFixture<WbcSpeciesResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
