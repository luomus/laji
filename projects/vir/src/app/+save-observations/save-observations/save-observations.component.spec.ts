import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveObservationsComponent } from './save-observations.component';

describe('SaveObservationsComponent', () => {
  let component: SaveObservationsComponent;
  let fixture: ComponentFixture<SaveObservationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveObservationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveObservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
