import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeResultComponent } from './nafi-bumblebee-result.component';

describe('NafiBumblebeeResultComponent', () => {
  let component: NafiBumblebeeResultComponent;
  let fixture: ComponentFixture<NafiBumblebeeResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
