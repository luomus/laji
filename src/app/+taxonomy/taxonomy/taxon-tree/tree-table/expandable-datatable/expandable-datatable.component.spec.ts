import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableDatatableComponent } from './expandable-datatable.component';

describe('ExpandableDatatableComponent', () => {
  let component: ExpandableDatatableComponent;
  let fixture: ComponentFixture<ExpandableDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpandableDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandableDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
