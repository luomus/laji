import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lu-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent {
  @Input() currentStep = 0;
  @Input() steps = [] as string[];
  @Output() stepBack = new EventEmitter<number>();
  onStepBackTo(i: number) {
    if (i >= this.currentStep) {
      return;
    }
    this.stepBack.emit(i);
  }
}

