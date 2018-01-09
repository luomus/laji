import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSelectComponent } from './header-select.component';

describe('HeaderSelectComponent', () => {
  let component: HeaderSelectComponent;
  let fixture: ComponentFixture<HeaderSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
