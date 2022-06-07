import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationUserTableComponent } from './identification-user-table.component';

describe('IdentificationUserTableComponent', () => {
  let component: IdentificationUserTableComponent;
  let fixture: ComponentFixture<IdentificationUserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationUserTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
