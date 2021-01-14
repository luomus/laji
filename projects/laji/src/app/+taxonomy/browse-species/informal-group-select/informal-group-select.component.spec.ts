import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InformalGroupSelectComponent } from './informal-group-select.component';

describe('InformalGroupSelectComponent', () => {
  let component: InformalGroupSelectComponent;
  let fixture: ComponentFixture<InformalGroupSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InformalGroupSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformalGroupSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
