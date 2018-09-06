import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchRowComponent } from './switch-row.component';

describe('SwitchRowComponent', () => {
  let component: SwitchRowComponent;
  let fixture: ComponentFixture<SwitchRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitchRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
