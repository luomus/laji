import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges,
  SimpleChanges, ChangeDetectorRef, OnDestroy, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';

interface NotInitialized {
  _tag: 'not-initialized';
}

interface Tsv2RowsInProgress {
  _tag: 'tsv-in-progress';
}

interface RequestHttpError {
  _tag: 'http-error';
  error: string;
}

interface ValidationInProgress {
  _tag: 'validation-in-progress';
}

interface ValidationComplete {
  _tag: 'validation-complete';
  result: components['schemas']['InputRow'][];
  validationResult: components['schemas']['TraitMultiValidationResponse'];
}

interface SubmissionInProgress {
  _tag: 'submitting';
}

type State = NotInitialized | Tsv2RowsInProgress | ValidationInProgress | ValidationComplete | RequestHttpError | SubmissionInProgress;

const apiInputRowsToTable = (res: components['schemas']['InputRow'][]): { cols: string[]; rows: any[][] } => {
  // Transform subjects to column-major sparse table
  const subjectAcc: Record<string, Array<any>> = {};
  res.forEach((row, index) => {
    Object.entries(row.subject).forEach(([key, value]) => {
      if (key in subjectAcc) {
        subjectAcc[key].push(...(new Array((index + 1) - subjectAcc[key].length).fill(undefined)));
        subjectAcc[key][index] = value;
      } else {
        subjectAcc[key] = new Array(index + 1).fill(undefined);
        subjectAcc[key][index] = value;
      }
    });
  });

  // ensure each column is the same length
  Object.values(subjectAcc).forEach(arr => {
    if (arr.length < res.length) {
      arr.push(...(new Array(res.length - arr.length).fill(undefined)));
    }
  });

  // Traits to column-major sparse table
  const traits = {} as Record<string, Record<string, Array<any>>>;
  res.forEach((row, index) => {
    row.traits?.forEach(trait => {
      if (!(trait.traitId in traits)) {
        traits[trait.traitId] = {} as Record<string, Array<any>>;
      }
      Object.entries(trait).forEach(([key, value]) => {
        if (key in traits[trait.traitId]) {
          traits[trait.traitId][key].push(...(new Array((index + 1) - traits[trait.traitId][key].length).fill(undefined)));
          traits[trait.traitId][key][index] = value;
        } else {
          traits[trait.traitId][key] = new Array(index + 1).fill(undefined);
          traits[trait.traitId][key][index] = value;
        }
      });
    });
  });

  // ensure each column is the same length
  Object.values(traits).forEach(trait => {
    Object.values(trait).forEach(arr => {
      if (arr.length < res.length) {
        arr.push(...(new Array(res.length - arr.length).fill(undefined)));
      }
    });
  });

  // flatten
  const flattenedTraits = {} as Record<string, Array<any>>;
  Object.values(traits).forEach((trait, index) => {
    Object.entries(trait).forEach(([key, value]) => {
      flattenedTraits[`Trait ${index + 1}: ${key}`] = value;
    });
  });

  // Transform to row-major
  const cols = [] as string[];
  const rows = new Array(res.length).fill(undefined).map(_ => [] as any[]);
  [...Object.entries(subjectAcc), ...Object.entries(flattenedTraits)].forEach(([key, value]) => {
    cols.push(key);
    rows.forEach((row, idx) => {
      row.push(value[idx]);
    });
  });

  return { cols, rows };
};

@Component({
  selector: 'laji-trait-db-data-entry-check',
  templateUrl: './data-entry-check.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEntryCheckComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) datasetId!: string;
  @Input({ required: true }) tsv!: string;

  @Output() submissionSuccess = new EventEmitter<null>();

  @ViewChild('cellTemplate') cellTemplate!: TemplateRef<any>;

  state$ = new BehaviorSubject<State>({ _tag: 'not-initialized' });
  table$ = new BehaviorSubject<{ rows: any; cols: any } | undefined>(undefined);
  objectEntries = Object.entries;

  private tsvChange = new BehaviorSubject<null>(null);

  constructor(
    private api: LajiApiClientBService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(state: State) {
    if (!(state._tag === 'validation-complete' && state.validationResult.pass)) {
      return;
    }
    const query = {
      personToken: this.userService.getToken()
    };
    this.state$.next({ _tag: 'submitting' });
    this.api.fetch('/trait/rows/multi', 'post', { query }, state.result).subscribe(
      () => {
        this.submissionSuccess.emit();
      },
      err => {
        console.error(err);
        this.state$.next({ _tag: 'http-error', error: JSON.stringify(err) });
      }
    );
  }

  ngAfterViewInit() {
    this.tsvChange.subscribe(() => {
      // transform tsv to rows
      const query = {
        datasetId: this.datasetId,
        personToken: this.userService.getToken()
      };
      this.state$.next({ _tag: 'tsv-in-progress' });
      this.api.fetch('/trait/rows/tsv2rows', 'post', { query }, this.tsv)
        .pipe(
          tap(res => {
            const table = apiInputRowsToTable(res);
            this.table$.next({
              cols: table.cols.map((col, index) => ({
                title: col,
                prop: index,
                cellTemplate: this.cellTemplate
              })),
              rows: table.rows
            });
            this.state$.next({ _tag: 'validation-in-progress' });
            this.cdr.markForCheck();
          }),
          switchMap(res =>
            this.api.fetch('/trait/rows/multi/validate', 'post', { query: { personToken: this.userService.getToken() } }, res).pipe(
              map(validationRes => ({_tag: 'validation-complete', result: res, validationResult: validationRes}) as ValidationComplete)
            )
          )
        )
        .subscribe(
          res => {
            this.state$.next(res);
          },
          err => {
            console.error(err);
            this.state$.next({ _tag: 'http-error', error: JSON.stringify(err) });
          }
        );
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tsv) {
      this.tsvChange.next(null);
    }
  }

  ngOnDestroy() {
    this.tsvChange.complete();
  }
}

