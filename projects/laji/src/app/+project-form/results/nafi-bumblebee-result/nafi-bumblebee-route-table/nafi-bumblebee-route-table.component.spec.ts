import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeRouteTableComponent } from './nafi-bumblebee-route-table.component';

describe('NafiBumblebeeRouteTableComponent', () => {
  let component: NafiBumblebeeRouteTableComponent;
  let fixture: ComponentFixture<NafiBumblebeeRouteTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeRouteTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeRouteTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
