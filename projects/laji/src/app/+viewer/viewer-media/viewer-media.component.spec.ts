import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerMediaComponent } from './viewer-media.component';

describe('ViewerMediaComponent', () => {
  let component: ViewerMediaComponent;
  let fixture: ComponentFixture<ViewerMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
