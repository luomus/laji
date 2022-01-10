import {Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter} from '@angular/core';
import {IRecordingAnnotation} from '../../../../../laji/src/app/+theme/kerttu/models';
import {IGlobalRecording} from '../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-recording-identification',
  templateUrl: './recording-identification.component.html',
  styleUrls: ['./recording-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingIdentificationComponent implements OnInit {
  recording = {
    audio: {
      url: '\thttps://image.laji.fi/cornell239808151/239808151_00.mp3'
    },
    xRange: [2, 12]
  };
  hasPreviousRecording = false;
  buttonsAreDisabled = false;

  @Output() nextRecordingClick = new EventEmitter();
  @Output() previousRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter();
  @Output() annotationChange = new EventEmitter<IRecordingAnnotation>();


  constructor() { }

  ngOnInit(): void {
  }

}
