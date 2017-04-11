/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NpEditComponent } from './np-edit.component';

describe('NpChooseComponent', () => {
  let component: NpEditComponent;
  let fixture: ComponentFixture<NpEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
