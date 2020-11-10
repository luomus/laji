import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityComponent } from './quality.component';

describe('QualityComponent', () => {
  let component: QualityComponent;
  let fixture: ComponentFixture<QualityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QualityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
