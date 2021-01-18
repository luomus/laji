import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MappingSelectComponent } from './mapping-select.component';

describe('MappingSelectComponent', () => {
  let component: MappingSelectComponent;
  let fixture: ComponentFixture<MappingSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
