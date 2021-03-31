import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RulerComponent } from './ruler.component';

describe('RulerComponent', () => {
  let component: RulerComponent;
  let fixture: ComponentFixture<RulerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RulerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
