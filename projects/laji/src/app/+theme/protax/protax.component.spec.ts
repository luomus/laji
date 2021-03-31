import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProtaxComponent } from './protax.component';

describe('ProtaxComponent', () => {
  let component: ProtaxComponent;
  let fixture: ComponentFixture<ProtaxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
