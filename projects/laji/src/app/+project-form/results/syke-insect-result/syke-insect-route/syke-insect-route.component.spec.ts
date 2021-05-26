import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SykeInsectRouteComponent } from './syke-insect-route.component';

describe('SykeInsectRouteComponent', () => {
  let component: SykeInsectRouteComponent;
  let fixture: ComponentFixture<SykeInsectRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SykeInsectRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SykeInsectRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
