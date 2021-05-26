import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SykeInsectRouteTableComponent } from './syke-insect-route-table.component';

describe('SykeInsectRouteTableComponent', () => {
  let component: SykeInsectRouteTableComponent;
  let fixture: ComponentFixture<SykeInsectRouteTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SykeInsectRouteTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SykeInsectRouteTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
