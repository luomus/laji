import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcRoutesListComponent } from './wbc-routes-list.component';

describe('WbcRoutesListComponent', () => {
  let component: WbcRoutesListComponent;
  let fixture: ComponentFixture<WbcRoutesListComponent>;

  beforeEach(async(() => {
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
