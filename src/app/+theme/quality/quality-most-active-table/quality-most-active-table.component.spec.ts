import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityMostActiveTableComponent } from './quality-most-active-table.component';

describe('QualityMostActiveTableComponent', () => {
  let component: QualityMostActiveTableComponent;
  let fixture: ComponentFixture<QualityMostActiveTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QualityMostActiveTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualityMostActiveTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
