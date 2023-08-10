import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationHistoryEditModalComponent } from './identification-history-edit-modal.component';

describe('IdentificationHistoryEditModalComponent', () => {
  let component: IdentificationHistoryEditModalComponent;
  let fixture: ComponentFixture<IdentificationHistoryEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationHistoryEditModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentificationHistoryEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
