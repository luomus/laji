import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Step } from '../../spreadsheet.facade';

enum Phase {
  file,
  colMapping,
  valueMapping,
  send,
  done
}

interface StepperPhase {
  phase: Phase;
  label: string;
  returnStep: number;
}

const defaultMapping: Record<Step, Phase> = {
  [Step.empty]: Phase.file,
  [Step.sheetLoadError]: Phase.file,
  [Step.requiredFieldsNull]: Phase.file,
  [Step.fileAlreadyUploadedPartially]: Phase.file,
  [Step.fileAlreadyUploaded]: Phase.file,
  [Step.invalidFileType]: Phase.file,
  [Step.invalidFormId]: Phase.file,
  [Step.importingFile]: Phase.file,
  [Step.colMapping]: Phase.colMapping,
  [Step.dataMapping]: Phase.valueMapping,
  [Step.importReady]: Phase.send,
  [Step.validating]: Phase.send,
  [Step.invalidData]: Phase.send,
  [Step.importing]: Phase.send,
  [Step.doneWithErrors]: Phase.done,
  [Step.doneOk]: Phase.done
};

const defaultPhases: StepperPhase[] = [
  {phase: Phase.file, label: 'excel.step1', returnStep: Step.empty},
  {phase: Phase.colMapping, label: 'excel.step2', returnStep: Step.colMapping},
  {phase: Phase.valueMapping, label: 'excel.step3', returnStep: Step.dataMapping},
  {phase: Phase.send, label: 'excel.step4', returnStep: Step.empty},
  {phase: Phase.done, label: 'excel.step5', returnStep: Step.importReady}
];

@Component({
  selector: 'laji-stepper',
  templateUrl: './stepper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent implements OnInit, OnChanges {
  @Input({ required: true }) step!: Step;
  @Input() mapping: Record<Step, Phase> = defaultMapping;
  @Input() phases: StepperPhase[] = defaultPhases;

  @Output() activate = new EventEmitter<number>();
  @Output() activePhaseChange = new EventEmitter<StepperPhase>();

  activePhaseIdx = 0;
  luStepperSteps!: string[];

  constructor(
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.updateSteps();
    this.sendActive();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.state) {
      const mappedState = this.mapping[this.step] || 'file';
      this.activePhaseIdx = this.phases.findIndex((item) => item.phase === mappedState);
      this.sendActive();
    }

    if (changes.steps) {
      this.updateSteps();
    }
  }

  onStepBack(idx: number) {
    if (idx < this.activePhaseIdx) {
      this.activate.emit(this.phases[idx].returnStep);
    }
  }

  private updateSteps() {
    this.luStepperSteps = this.phases.map(phase => this.translateService.instant(phase.label) || '');
  }

  private sendActive() {
    if (this.activePhaseIdx > -1) {
      this.activePhaseChange.emit(this.phases[this.activePhaseIdx]);
    }
  }
}
