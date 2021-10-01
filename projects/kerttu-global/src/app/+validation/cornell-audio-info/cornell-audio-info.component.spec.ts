import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CornellAudioInfoComponent } from './cornell-audio-info.component';

describe('CornellAudioInfoComponent', () => {
  let component: CornellAudioInfoComponent;
  let fixture: ComponentFixture<CornellAudioInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CornellAudioInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CornellAudioInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
