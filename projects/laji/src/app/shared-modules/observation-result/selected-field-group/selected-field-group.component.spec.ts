import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedFieldGroupComponent } from './selected-field-group.component';

describe('SelectedFieldGroupComponent', () => {
  let component: SelectedFieldGroupComponent;
  let fixture: ComponentFixture<SelectedFieldGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedFieldGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedFieldGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
