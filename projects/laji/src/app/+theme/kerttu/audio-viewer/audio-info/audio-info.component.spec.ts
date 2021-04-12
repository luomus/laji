import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioInfoComponent } from './audio-info.component';

describe('AudioInfoComponent', () => {
  let component: AudioInfoComponent;
  let fixture: ComponentFixture<AudioInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
