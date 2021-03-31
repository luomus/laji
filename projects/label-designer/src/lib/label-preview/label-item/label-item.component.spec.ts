import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelItemComponent } from './label-item.component';

describe('LabelItemComponent', () => {
  let component: LabelItemComponent;
  let fixture: ComponentFixture<LabelItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
