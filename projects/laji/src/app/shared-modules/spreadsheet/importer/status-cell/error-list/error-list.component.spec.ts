import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ErrorListComponent } from './error-list.component';

describe('ErrorListComponent', () => {
  let component: ErrorListComponent;
  let fixture: ComponentFixture<ErrorListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
