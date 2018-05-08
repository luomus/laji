import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { States } from '../../importer/importer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent implements OnInit {

  _state: States;
  active: number;
  @Output() activate = new EventEmitter<string>();
  @Output() title = new EventEmitter<string>();

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
    {name: 'file', label: 'excel.step1', returnState: 'empty'},
    {name: 'colMapping', label: 'excel.step2', returnState: 'colMapping'},
    {name: 'valueMapping', label: 'excel.step3', returnState: 'dataMapping'},
    {name: 'send', label: 'excel.step4', returnState: 'empty'},
    {name: 'done', label: 'excel.step5', returnState: 'importReady'}
  ];

  private labels = false;

  constructor(
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.translateService.get(this.steps.map(step => step.label))
      .subscribe(labels => {
        this.steps.forEach(step => {
          if (labels[step.label]) {
            step.label = labels[step.label];
          }
        });
        this.labels = true;
        this.sendActive();
        this.cdr.markForCheck();
      });
  }

  @Input() set state(state: States) {
    this._state = state;
    const mappedState = this.mapping[state] || 'file';
    this.active = this.steps.findIndex((step) => {
      return step.name === mappedState;
    });
    this.sendActive();
  }

  backTo(idx) {
    if (idx < this.active) {
      this.activate.emit(this.steps[idx].returnState);
    }
  }

  private sendActive() {
    console.log('TRYING TO SEND');
    if (this.active > -1 && this.labels) {
      console.log('TRYING TO SEND OK!!!');
      this.title.emit(this.steps[this.active].label);
    }
  }

}
