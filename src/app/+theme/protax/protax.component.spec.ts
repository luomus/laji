import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtaxComponent } from './protax.component';

describe('ProtaxComponent', () => {
  let component: ProtaxComponent;
  let fixture: ComponentFixture<ProtaxComponent>;

  beforeEach(async(() => {
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
