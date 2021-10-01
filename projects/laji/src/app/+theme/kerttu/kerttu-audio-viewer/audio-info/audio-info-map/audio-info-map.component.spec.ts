import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioInfoMapComponent } from './audio-info-map.component';

describe('AudioInfoMapComponent', () => {
  let component: AudioInfoMapComponent;
  let fixture: ComponentFixture<AudioInfoMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioInfoMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioInfoMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
