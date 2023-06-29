import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationHistoryTableComponent } from './identification-history-table.component';

describe('IdentificationHistoryTableComponent', () => {
  let component: IdentificationHistoryTableComponent;
  let fixture: ComponentFixture<IdentificationHistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationHistoryTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentificationHistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
