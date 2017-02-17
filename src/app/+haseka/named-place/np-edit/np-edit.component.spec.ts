/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NpChooseComponent } from './np-choose.component';

describe('NpChooseComponent', () => {
  let component: NpChooseComponent;
  let fixture: ComponentFixture<NpChooseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpChooseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpChooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
