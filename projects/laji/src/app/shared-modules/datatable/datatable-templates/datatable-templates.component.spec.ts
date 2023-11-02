import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatatableTemplatesComponent } from './datatable-templates.component';

describe('DatatableTemplatesComponent', () => {
  let component: DatatableTemplatesComponent;
  let fixture: ComponentFixture<DatatableTemplatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
