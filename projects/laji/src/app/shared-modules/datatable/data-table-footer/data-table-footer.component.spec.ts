import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataTableFooterComponent } from './data-table-footer.component';

describe('DataTableFooterComponent', () => {
  let component: DataTableFooterComponent;
  let fixture: ComponentFixture<DataTableFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DataTableFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
