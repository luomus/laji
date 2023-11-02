import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InformalListComponent } from './informal-list.component';

describe('InformalListComponent', () => {
  let component: InformalListComponent;
  let fixture: ComponentFixture<InformalListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InformalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
