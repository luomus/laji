import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeRouteComponent } from './nafi-bumblebee-route.component';

describe('NafiBumblebeeRouteComponent', () => {
  let component: NafiBumblebeeRouteComponent;
  let fixture: ComponentFixture<NafiBumblebeeRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
