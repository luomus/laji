import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesResultLinechartsComponent } from './wbc-species-result-linecharts.component';

describe('WbcSpeciesResultLinechartsComponent', () => {
  let component: WbcSpeciesResultLinechartsComponent;
  let fixture: ComponentFixture<WbcSpeciesResultLinechartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesResultLinechartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesResultLinechartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
