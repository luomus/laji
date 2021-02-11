import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeMapComponent } from './nafi-bumblebee-map.component';

describe('NafiBumblebeeMapComponent', () => {
  let component: NafiBumblebeeMapComponent;
  let fixture: ComponentFixture<NafiBumblebeeMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
