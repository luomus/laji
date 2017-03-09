/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NpListComponent } from './np-list.component';

describe('NpListComponent', () => {
  let component: NpListComponent;
  let fixture: ComponentFixture<NpListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
