import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatusCellComponent } from './status-cell.component';

describe('StatusCellComponent', () => {
  let component: StatusCellComponent;
  let fixture: ComponentFixture<StatusCellComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
