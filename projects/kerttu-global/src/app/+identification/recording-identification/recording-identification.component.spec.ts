import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingIdentificationComponent } from './recording-identification.component';

describe('RecordingIdentificationComponent', () => {
  let component: RecordingIdentificationComponent;
  let fixture: ComponentFixture<RecordingIdentificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordingIdentificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordingIdentificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
