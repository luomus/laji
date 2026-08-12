import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription, combineLatest, map } from 'rxjs';

interface ImportStep {
  _tag: 'import';
  datasetId: string;
}

interface ValidateStep {
  _tag: 'validate';
  tsv: string;
}

interface CheckStep {
  _tag: 'check';
}

interface ReadyStep {
  _tag: 'ready';
}

type Step = ImportStep | ValidateStep | CheckStep | ReadyStep;
type StepTag = Step['_tag'];

@Component({
    templateUrl: './trait-db-data-entry.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TraitDbDataEntryComponent implements OnInit, OnDestroy {
  stepStack$ = new BehaviorSubject<Step[]>([]);
  private subscription = new Subscription();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.subscription.add(
      combineLatest([
        this.route.params.pipe(map(params => params.id as string)),
        this.route.queryParamMap.pipe(map(query => this.parseStepTag(query.get('step'))))
      ]).subscribe(([datasetId, requestedStep]) => {
        const requested = requestedStep ?? 'import';
        const stackWithDataset = this.ensureDataset(this.stepStack$.value, datasetId);
        const resolved = this.clampRequestedTag(stackWithDataset, requested);
        const nextStack = this.sliceToTag(stackWithDataset, resolved);
        this.stepStack$.next(nextStack);

        // Normalize URL if query param is missing/invalid or points to an unreachable step.
        if (resolved !== requested || requestedStep === undefined) {
          this.navigateToStep(resolved, true);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onStepBack(idx: number) {
    this.navigateToStep(this.idxToStepTag(idx));
  }

  onTsvChange(tsv: string | null) {
    const current = this.stepStack$.value;
    if (!tsv) {
      const importOnly = this.sliceToTag(current, 'import');
      this.stepStack$.next(importOnly);
      this.navigateToStep('import');
      return;
    }
    const withValidate = this.pushValidate(current, tsv);
    this.stepStack$.next(withValidate);
    this.navigateToStep('validate');
  }

  onValidationSuccess() {
    const withCheck = this.pushCheck(this.stepStack$.value);
    this.stepStack$.next(withCheck);
    this.navigateToStep('check');
  }

  onSubmissionSuccess() {
    const withReady = this.pushReady(this.stepStack$.value);
    this.stepStack$.next(withReady);
    this.navigateToStep('ready');
  }

  private parseStepTag(value: string | null): StepTag | undefined {
    if (value === 'import' || value === 'validate' || value === 'check' || value === 'ready') {
      return value;
    }
    return undefined;
  }

  private idxToStepTag(idx: number): StepTag {
    if (idx <= 0) {
      return 'import';
    }
    if (idx === 1) {
      return 'validate';
    }
    if (idx === 2) {
      return 'check';
    }
    return 'ready';
  }

  private ensureDataset(stack: Step[], datasetId: string): Step[] {
    const importStep = stack[0];
    if (!importStep || importStep._tag !== 'import' || importStep.datasetId !== datasetId) {
      return [{ _tag: 'import', datasetId }];
    }
    return stack;
  }

  private clampRequestedTag(stack: Step[], requested: StepTag): StepTag {
    const requestedIdx = this.stepTagToIdx(requested);
    const maxIdx = this.stepTagToIdx(this.maxReachableTag(stack));
    return this.idxToStepTag(Math.min(requestedIdx, maxIdx));
  }

  private maxReachableTag(stack: Step[]): StepTag {
    if (stack.length <= 1) {
      return 'import';
    }
    if (stack.length === 2) {
      return 'validate';
    }
    if (stack.length === 3) {
      return 'check';
    }
    return 'ready';
  }

  private sliceToTag(stack: Step[], step: StepTag): Step[] {
    return stack.slice(0, this.stepTagToIdx(step) + 1);
  }

  private pushValidate(stack: Step[], tsv: string): Step[] {
    const importStep = this.getImportStep(stack);
    if (!importStep) {
      return stack;
    }
    return [importStep, { _tag: 'validate', tsv }];
  }

  private pushCheck(stack: Step[]): Step[] {
    const importStep = this.getImportStep(stack);
    const validateStep = this.getValidateStep(stack);
    if (!importStep || !validateStep) {
      return stack;
    }
    return [importStep, validateStep, { _tag: 'check' }];
  }

  private pushReady(stack: Step[]): Step[] {
    const importStep = this.getImportStep(stack);
    const validateStep = this.getValidateStep(stack);
    const checkStep = this.getCheckStep(stack);
    if (!importStep || !validateStep || !checkStep) {
      return stack;
    }
    return [importStep, validateStep, checkStep, { _tag: 'ready' }];
  }

  private getImportStep(stack: Step[]): ImportStep | undefined {
    const step = stack[0];
    return step?._tag === 'import' ? step : undefined;
  }

  private getValidateStep(stack: Step[]): ValidateStep | undefined {
    const step = stack[1];
    return step?._tag === 'validate' ? step : undefined;
  }

  private getCheckStep(stack: Step[]): CheckStep | undefined {
    const step = stack[2];
    return step?._tag === 'check' ? step : undefined;
  }

  private stepTagToIdx(step: StepTag): number {
    if (step === 'import') {
      return 0;
    }
    if (step === 'validate') {
      return 1;
    }
    if (step === 'check') {
      return 2;
    }
    return 3;
  }

  private navigateToStep(step: StepTag, replaceUrl = false) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { step },
      queryParamsHandling: 'merge',
      replaceUrl
    });
  }
}
