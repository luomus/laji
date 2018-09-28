import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesResultMapsComponent } from './wbc-species-result-maps.component';

describe('WbcSpeciesResultMapsComponent', () => {
  let component: WbcSpeciesResultMapsComponent;
  let fixture: ComponentFixture<WbcSpeciesResultMapsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesResultMapsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesResultMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
