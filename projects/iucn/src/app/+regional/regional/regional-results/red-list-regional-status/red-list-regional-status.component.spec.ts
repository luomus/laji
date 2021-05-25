import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedListRegionalStatusComponent } from './red-list-regional-status.component';

describe('RedListRegionalStatusComponent', () => {
  let component: RedListRegionalStatusComponent;
  let fixture: ComponentFixture<RedListRegionalStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedListRegionalStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedListRegionalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
