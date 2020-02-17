import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeImportComponent } from './theme-import.component';

describe('ThemeImportComponent', () => {
  let component: ThemeImportComponent;
  let fixture: ComponentFixture<ThemeImportComponent>;

  beforeEach(async(() => {
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
