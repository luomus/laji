import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatheringComponent } from './gathering.component';

describe('GatheringComponent', () => {
  let component: GatheringComponent;
  let fixture: ComponentFixture<GatheringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatheringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatheringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
