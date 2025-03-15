import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Step } from '../../spreadsheet.facade';

const defaultMapping = {
  [Step.empty]: 'file',
  [Step.sheetLoadError]: 'file',
  [Step.fileAlreadyUploadedPartially]: 'file',
  [Step.fileAlreadyUploaded]: 'file',
  [Step.invalidFileType]: 'file',
  [Step.invalidFormId]: 'file',
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

const defaultSteps = [
  {name: 'file', label: 'excel.step1', returnState: Step.empty},
  {name: 'colMapping', label: 'excel.step2', returnState: Step.colMapping},
  {name: 'valueMapping', label: 'excel.step3', returnState: Step.dataMapping},
  {name: 'send', label: 'excel.step4', returnState: Step.empty},
  {name: 'done', label: 'excel.step5', returnState: Step.importReady}
];

@Component({
  selector: 'laji-stepper',
  templateUrl: './stepper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent implements OnInit, OnChanges {
  @Input() state!: Step;
  @Input() mapping = defaultMapping;
  @Input() steps: {name: string; label: string; returnState: number}[] = defaultSteps;
  @Output() activate = new EventEmitter<number>();
  @Output() title = new EventEmitter<string>();

  currentStep = 0;
  luStepperSteps!: string[];

  private labels = false;

  constructor(
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.updateSteps();
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.state) {
      const mappedState = (this.mapping as any)[this.state] || 'file';
      this.currentStep = this.steps.findIndex((item) => item.name === mappedState);
      this.sendActive();
    }

    if (changes.steps) {
      this.updateSteps();
    }
  }

  onStepBack(idx: number) {
    if (idx < this.currentStep) {
      this.activate.emit(this.steps[idx].returnState);
    }
  }

  private updateSteps() {
    this.luStepperSteps = this.steps.map(step => this.translateService.instant(step.label) || '');
  }

  private sendActive() {
    if (this.currentStep > -1 && this.labels) {
      this.title.emit(this.steps[this.currentStep].label);
    }
  }
}
