import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeGenerateSpreadsheetComponent } from './theme-generate-spreadsheet.component';

describe('ThemeGenerateSpreadsheetComponent', () => {
  let component: ThemeGenerateSpreadsheetComponent;
  let fixture: ComponentFixture<ThemeGenerateSpreadsheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeGenerateSpreadsheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeGenerateSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
