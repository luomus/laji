import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThemeImportComponent } from './theme-import.component';

describe('ThemeImportComponent', () => {
  let component: ThemeImportComponent;
  let fixture: ComponentFixture<ThemeImportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
