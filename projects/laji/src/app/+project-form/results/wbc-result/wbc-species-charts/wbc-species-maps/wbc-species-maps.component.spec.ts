import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcSpeciesMapsComponent } from './wbc-species-maps.component';

describe('WbcSpeciesMapsComponent', () => {
  let component: WbcSpeciesMapsComponent;
  let fixture: ComponentFixture<WbcSpeciesMapsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesMapsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
