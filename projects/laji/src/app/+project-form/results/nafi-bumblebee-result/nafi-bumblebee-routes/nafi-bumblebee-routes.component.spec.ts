import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeRoutesComponent } from './nafi-bumblebee-routes.component';

describe('NafiBumblebeeRoutesComponent', () => {
  let component: NafiBumblebeeRoutesComponent;
  let fixture: ComponentFixture<NafiBumblebeeRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeRoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
