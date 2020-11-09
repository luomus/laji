import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcRoutesComponent } from './wbc-routes.component';

describe('WbcRoutesComponent', () => {
  let component: WbcRoutesComponent;
  let fixture: ComponentFixture<WbcRoutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcRoutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
