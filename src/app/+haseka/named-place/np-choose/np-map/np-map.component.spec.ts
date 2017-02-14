/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NpMapComponent } from './np-map.component';

describe('NpMapComponent', () => {
  let component: NpMapComponent;
  let fixture: ComponentFixture<NpMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
