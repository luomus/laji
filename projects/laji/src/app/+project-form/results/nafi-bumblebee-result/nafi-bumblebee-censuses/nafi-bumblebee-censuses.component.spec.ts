import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeCensusesComponent } from './nafi-bumblebee-censuses.component';

describe('NafiBumblebeeCensusesComponent', () => {
  let component: NafiBumblebeeCensusesComponent;
  let fixture: ComponentFixture<NafiBumblebeeCensusesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeCensusesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeCensusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
