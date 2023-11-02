import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InfoCardHeaderComponent } from './info-card-header.component';

describe('InfoCardHeaderComponent', () => {
  let component: InfoCardHeaderComponent;
  let fixture: ComponentFixture<InfoCardHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoCardHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
