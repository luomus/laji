import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LajiUiComponent } from './laji-ui.component';

describe('LajiUiComponent', () => {
  let component: LajiUiComponent;
  let fixture: ComponentFixture<LajiUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LajiUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LajiUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
