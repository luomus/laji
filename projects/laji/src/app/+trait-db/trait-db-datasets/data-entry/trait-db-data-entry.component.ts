import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

interface ImportStep {
  _tag: 'import';
  datasetId: string;
}

interface ValidateStep {
  _tag: 'validate';
  tsv: string;
  datasetId: string;
}

interface CheckStep {
  _tag: 'check';
  tsv: string;
  datasetId: string;
}

interface ReadyStep {
  _tag: 'ready';
  datasetId: string;
}

type Step = ImportStep | ValidateStep | CheckStep | ReadyStep;

@Component({
  templateUrl: './trait-db-data-entry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraitDbDataEntryComponent implements OnInit, OnDestroy {
  stepStack$ = new BehaviorSubject<Step[]>([]);
  private subscription = new Subscription();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.subscription.add(
      this.route.params.pipe(map(params => params.id)).subscribe(datasetId => {
        this.stepStack$.next([{ _tag: 'import', datasetId }]);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onStepBack(idx: number) {
    this.stepBack(idx);
  }

  onTsvChange(tsv: string | null) {
    if (!tsv) {
      this.stepBack(0);
      return;
    }
    const stack = this.stepStack$.value;
    const readyStep = stack[0];
    stack.push({ _tag: 'validate', datasetId: readyStep.datasetId, tsv });
    this.stepStack$.next(stack);
  }

  onValidationSuccess() {
    const stack = this.stepStack$.value;
    const validateStep = stack[1] as ValidateStep;
    stack.push({ _tag: 'check', datasetId: validateStep.datasetId, tsv: validateStep.tsv });
    this.stepStack$.next(stack);
  }

  onSubmissionSuccess() {
    const stack = this.stepStack$.value;
    const checkStep = stack[2] as CheckStep;
    stack.push({ _tag: 'ready', datasetId: checkStep.datasetId });
    this.stepStack$.next(stack);
  }

  private stepBack(idx: number) {
    const steps = this.stepStack$.value;
    const newSteps = steps.slice(0, idx + 1);
    this.stepStack$.next(newSteps);
  }
}

