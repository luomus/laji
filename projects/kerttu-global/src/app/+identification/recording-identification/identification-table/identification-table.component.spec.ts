import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationTableComponent } from './identification-table.component';

describe('IdentificationTableComponent', () => {
  let component: IdentificationTableComponent;
  let fixture: ComponentFixture<IdentificationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
