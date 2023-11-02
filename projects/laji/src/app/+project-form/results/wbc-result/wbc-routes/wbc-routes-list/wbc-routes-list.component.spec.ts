import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcRoutesListComponent } from './wbc-routes-list.component';

describe('WbcRoutesListComponent', () => {
  let component: WbcRoutesListComponent;
  let fixture: ComponentFixture<WbcRoutesListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcRoutesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcRoutesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
