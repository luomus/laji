/**
 * Created by mjtahtin on 18.4.2017.
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HerpetologyComponent } from './herpetology.component';

describe('HerpetologyComponent', () => {
  let component: HerpetologyComponent;
  let fixture: ComponentFixture<HerpetologyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HerpetologyComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HerpetologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
