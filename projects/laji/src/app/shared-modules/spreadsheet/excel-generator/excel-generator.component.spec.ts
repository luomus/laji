import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExcelGeneratorComponent } from './excel-generator.component';

describe('ExcelGeneratorComponent', () => {
  let component: ExcelGeneratorComponent;
  let fixture: ComponentFixture<ExcelGeneratorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExcelGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
