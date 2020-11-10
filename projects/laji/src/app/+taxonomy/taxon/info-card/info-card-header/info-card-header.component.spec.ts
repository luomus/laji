import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCardHeaderComponent } from './info-card-header.component';

describe('InfoCardHeaderComponent', () => {
  let component: InfoCardHeaderComponent;
  let fixture: ComponentFixture<InfoCardHeaderComponent>;

  beforeEach(async(() => {
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
