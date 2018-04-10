import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { States } from '../../importer/importer.component';

@Component({
  selector: 'laji-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent implements OnInit {

  _state: States;
  active: number;
  @Output() onActive = new EventEmitter<string>();

  mapping = {
    'empty': 'file',
    'fileAlreadyUploadedPartially': 'file',
    'fileAlreadyUploaded': 'file',
    'ambiguousColumns': 'file',
    'invalidFileType': 'file',
    'importingFile': 'file',
    'colMapping': 'colMapping',
    'dataMapping': 'valueMapping',
    'importReady': 'send',
    'validating': 'send',
    'invalidData': 'send',
    'importing': 'send',
    'doneWithErrors': 'done',
    'doneOk': 'done'
  };

  steps: {name: string, label: string, returnState: string}[] = [
    {name: 'file', label: 'Valitse tiedosto', returnState: 'empty'},
    {name: 'colMapping', label: 'Sarakkeiden linkittäminen', returnState: 'colMapping'},
    {name: 'valueMapping', label: 'Arvojen linkittäminen', returnState: 'dataMapping'},
    {name: 'send', label: 'Tarkistus ja Lähetys', returnState: 'importReady'},
    {name: 'done', label: 'valmis', returnState: 'importReady'}
  ];

  constructor() { }

  ngOnInit() {
  }

  @Input() set state(state: States) {
    this._state = state;
    const mappedState = this.mapping[state] || 'file';
    this.active = this.steps.findIndex((step) => {
      return step.name === mappedState;
    });
  }

  backTo(idx) {
    if (idx === 0) {
      this.onActive.emit(this.steps[idx].returnState);
    }
  }

}
