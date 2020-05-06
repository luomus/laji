import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageByPersonComponent } from './usage-by-person.component';

describe('UsageByPersonComponent', () => {
  let component: UsageByPersonComponent;
  let fixture: ComponentFixture<UsageByPersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageByPersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageByPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
