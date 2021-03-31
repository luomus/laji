import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OwnDatatableComponent } from './own-datatable.component';

describe('OwnDatatableComponent', () => {
  let component: OwnDatatableComponent;
  let fixture: ComponentFixture<OwnDatatableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OwnDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
