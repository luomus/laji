/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InvasiveComponent } from './invasive.component';

describe('InvasiveComponent', () => {
  let component: InvasiveComponent;
  let fixture: ComponentFixture<InvasiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvasiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvasiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
