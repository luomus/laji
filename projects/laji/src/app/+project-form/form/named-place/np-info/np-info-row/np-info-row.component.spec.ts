/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NpInfoRowComponent } from './np-info-row.component';

describe('NpInfoRowComponent', () => {
  let component: NpInfoRowComponent;
  let fixture: ComponentFixture<NpInfoRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpInfoRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpInfoRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
