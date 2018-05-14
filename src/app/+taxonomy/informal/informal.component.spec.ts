import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformalComponent } from './informal.component';

describe('InformalComponent', () => {
  let component: InformalComponent;
  let fixture: ComponentFixture<InformalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
