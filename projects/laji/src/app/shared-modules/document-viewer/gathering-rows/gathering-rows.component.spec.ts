import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatheringRowsComponent } from './gathering-rows.component';

describe('GatheringRowsComponent', () => {
  let component: GatheringRowsComponent;
  let fixture: ComponentFixture<GatheringRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatheringRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatheringRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
