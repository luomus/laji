import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingSelectComponent } from './mapping-select.component';

describe('MappingSelectComponent', () => {
  let component: MappingSelectComponent;
  let fixture: ComponentFixture<MappingSelectComponent>;

  beforeEach(async(() => {
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
