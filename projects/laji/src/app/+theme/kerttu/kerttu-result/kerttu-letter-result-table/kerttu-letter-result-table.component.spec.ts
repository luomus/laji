import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuLetterResultTableComponent } from './kerttu-letter-result-table.component';

describe('KerttuLetterResultTableComponent', () => {
  let component: KerttuLetterResultTableComponent;
  let fixture: ComponentFixture<KerttuLetterResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerttuLetterResultTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuLetterResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
