import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesMapsComponent } from './wbc-species-maps.component';

describe('WbcSpeciesMapsComponent', () => {
  let component: WbcSpeciesMapsComponent;
  let fixture: ComponentFixture<WbcSpeciesMapsComponent>;

  beforeEach(async(() => {
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
