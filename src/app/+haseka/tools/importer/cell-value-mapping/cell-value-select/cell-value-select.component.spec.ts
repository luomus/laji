import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CellValueSelectComponent } from './cell-value-select.component';

describe('CellValueSelectComponent', () => {
  let component: CellValueSelectComponent;
  let fixture: ComponentFixture<CellValueSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CellValueSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CellValueSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
