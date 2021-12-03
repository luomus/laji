import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuAudioViewerComponent } from './kerttu-audio-viewer.component';

describe('KerttuAudioViewerComponent', () => {
  let component: KerttuAudioViewerComponent;
  let fixture: ComponentFixture<KerttuAudioViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerttuAudioViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuAudioViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
