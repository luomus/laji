import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableTemplatesComponent } from './datatable-templates.component';

describe('DatatableTemplatesComponent', () => {
  let component: DatatableTemplatesComponent;
  let fixture: ComponentFixture<DatatableTemplatesComponent>;

  beforeEach(async(() => {
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
