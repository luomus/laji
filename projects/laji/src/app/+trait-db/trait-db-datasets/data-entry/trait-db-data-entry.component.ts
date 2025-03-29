import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ImportStep {
  _tag: 'import';
  tsv: string | null;
}

const defaultImportStep = { _tag: 'import', tsv: null } as ImportStep;

interface ValidateStep {
  _tag: 'validate';
}

const defaultValidateStep = { _tag: 'validate' } as ValidateStep;

interface CheckStep {
  _tag: 'check';
}

const defaultCheckStep = { _tag: 'check' } as CheckStep;

interface ReadyStep {
  _tag: 'ready';
}

const defaultReadyStep = { _tag: 'ready' } as ReadyStep;

const initialStepData = [
  {...defaultImportStep}, {...defaultValidateStep}, {...defaultCheckStep}, {...defaultReadyStep}
] as [ImportStep, ValidateStep, CheckStep, ReadyStep];

@Component({
  templateUrl: './trait-db-data-entry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraitDbDataEntryComponent implements OnInit {
  stepData = initialStepData;
  currentStep = 0;

  datasetId$!: Observable<string>;
  tsv = ''; // TODO refactor

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.datasetId$ = this.route.params.pipe(map(params => params.id));
  }

  onStepBack(idx: number) {
    this.currentStep = idx;
  }

  onTsvChange(tsv: string | null) {
    if (!tsv) {
      this.currentStep = 0;
      return;
    }
    this.tsv = tsv;
    this.currentStep = 1;
  }

  onValidationSuccess() {
    this.currentStep = 2;
  }

  onSubmissionSuccess() {
    this.currentStep = 3;
  }
}

