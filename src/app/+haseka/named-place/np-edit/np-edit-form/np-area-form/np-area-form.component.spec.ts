import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NpAreaFormComponent } from './np-area-form.component';

describe('NpAreaFormComponent', () => {
  let component: NpAreaFormComponent;
  let fixture: ComponentFixture<NpAreaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpAreaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpAreaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
