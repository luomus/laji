import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectrogramCanvasComponent } from './spectrogram-canvas.component';

describe('SpectrogramCanvasComponent', () => {
  let component: SpectrogramCanvasComponent;
  let fixture: ComponentFixture<SpectrogramCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpectrogramCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpectrogramCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
