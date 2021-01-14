import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LineTransectComponent } from './line-transect.component';

describe('LineTransectComponent', () => {
  let component: LineTransectComponent;
  let fixture: ComponentFixture<LineTransectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LineTransectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineTransectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
