import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesLinechartsComponent } from './wbc-species-linecharts.component';

describe('WbcSpeciesLinechartsComponent', () => {
  let component: WbcSpeciesLinechartsComponent;
  let fixture: ComponentFixture<WbcSpeciesLinechartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesLinechartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesLinechartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
