import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectrogramComponent } from './spectrogram.component';

describe('SpectrogramComponent', () => {
  let component: SpectrogramComponent;
  let fixture: ComponentFixture<SpectrogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpectrogramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpectrogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
