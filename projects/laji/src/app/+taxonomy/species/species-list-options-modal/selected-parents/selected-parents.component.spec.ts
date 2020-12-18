import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectedParentsComponent } from './selected-parents.component';

describe('SelectedParentsComponent', () => {
  let component: SelectedParentsComponent;
  let fixture: ComponentFixture<SelectedParentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedParentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedParentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
