import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Step } from '../../spreadsheet.facade';

@Component({
  selector: 'laji-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent implements OnInit {

  _state: number;
  active: number;
  @Output() activate = new EventEmitter<number>();
  @Output() title = new EventEmitter<string>();

  @Input() mapping = {
    [Step.empty]: 'file',
    [Step.fileAlreadyUploadedPartially]: 'file',
    [Step.fileAlreadyUploaded]: 'file',
    [Step.ambiguousColumns]: 'file',
    [Step.invalidFileType]: 'file',
    [Step.importingFile]: 'file',
    [Step.colMapping]: 'colMapping',
    [Step.dataMapping]: 'valueMapping',
    [Step.importReady]: 'send',
    [Step.validating]: 'send',
    [Step.invalidData]: 'send',
    [Step.importing]: 'send',
    [Step.doneWithErrors]: 'done',
    [Step.doneOk]: 'done'
  };

  @Input() steps: {name: string, label: string, returnState: number}[] = [
    {name: 'file', label: 'excel.step1', returnState: Step.empty},
    {name: 'colMapping', label: 'excel.step2', returnState: Step.colMapping},
    {name: 'valueMapping', label: 'excel.step3', returnState: Step.dataMapping},
    {name: 'send', label: 'excel.step4', returnState: Step.empty},
    {name: 'done', label: 'excel.step5', returnState: Step.importReady}
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

  @Input() set state(step: Step) {
    this._state = step;
    const mappedState = this.mapping[step] || 'file';
    this.active = this.steps.findIndex((item) => {
      return item.name === mappedState;
    });
    this.sendActive();
  }

  backTo(idx) {
    if (idx < this.active) {
      this.activate.emit(this.steps[idx].returnState);
    }
  }

  private sendActive() {
    if (this.active > -1 && this.labels) {
      this.title.emit(this.steps[this.active].label);
    }
  }

}
