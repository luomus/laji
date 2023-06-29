import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationHistoryComponent } from './identification-history.component';

describe('IdentificationHistoryComponent', () => {
  let component: IdentificationHistoryComponent;
  let fixture: ComponentFixture<IdentificationHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentificationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
