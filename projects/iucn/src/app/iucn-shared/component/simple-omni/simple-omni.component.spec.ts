import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleOmniComponent } from './simple-omni.component';

describe('SimpleOmniComponent', () => {
  let component: SimpleOmniComponent;
  let fixture: ComponentFixture<SimpleOmniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleOmniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleOmniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
