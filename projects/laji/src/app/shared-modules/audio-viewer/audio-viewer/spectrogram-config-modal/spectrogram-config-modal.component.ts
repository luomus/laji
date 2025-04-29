import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export interface SpectrogramConfigForm {
  minFrequency: number;
  maxFrequency: number;
  noiseReduction: number;
}

export function maxFrequencyGreaterThanMinFrequency(control: AbstractControl): ValidationErrors | null {
  const minFrequency = control.get('minFrequency')?.value;
  const maxFrequency = control.get('maxFrequency')?.value;

  if (minFrequency == null || maxFrequency == null) {
    return null;
  }

  return maxFrequency > minFrequency ? null : {maxFrequencyGreaterThanMinFrequency: {minFrequency, maxFrequency}};
}

@Component({
  selector: 'laji-spectrogram-config-modal',
  templateUrl: './spectrogram-config-modal.component.html',
  styleUrls: ['./spectrogram-config-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectrogramConfigModalComponent implements OnInit {
  @Input({ required: true }) minFrequencyLimit!: number;
  @Input({ required: true }) maxFrequencyLimit!: number;
  @Input({ required: true }) minFrequency!: number;
  @Input({ required: true }) maxFrequency!: number;
  @Input({ required: true }) noiseReduction!: number;
  @Input({ required: true }) defaultNoiseReduction!: number;

  @Output() hideModal = new EventEmitter<SpectrogramConfigForm>();

  spectrogramConfigForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.spectrogramConfigForm = this.formBuilder.group({
      minFrequency: this.minFrequency / 1000,
      maxFrequency: this.maxFrequency / 1000,
      noiseReduction: this.noiseReduction
    }, { validators: [maxFrequencyGreaterThanMinFrequency] });
  }

  reset() {
    this.spectrogramConfigForm.get('minFrequency')?.setValue(this.minFrequencyLimit / 1000);
    this.spectrogramConfigForm.get('maxFrequency')?.setValue(this.maxFrequencyLimit / 1000);
    this.spectrogramConfigForm.get('noiseReduction')?.setValue(this.defaultNoiseReduction);
  }

  onSubmit() {
    if (this.spectrogramConfigForm.valid) {
      const value = this.spectrogramConfigForm.value;
      this.hideModal.emit({
        minFrequency: value.minFrequency * 1000,
        maxFrequency: value.maxFrequency * 1000,
        noiseReduction: value.noiseReduction
      });
    }
  }
}
