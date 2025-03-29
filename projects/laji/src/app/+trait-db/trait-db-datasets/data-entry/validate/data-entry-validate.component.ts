import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef,
  ViewChild, TemplateRef, OnDestroy, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { BehaviorSubject, Subject } from 'rxjs';

interface ValidationNotStarted {
  _tag: 'not-started';
}

interface ValidationInProgress {
  _tag: 'in-progress';
}

interface ValidationHttpError {
  _tag: 'http-error';
  error: string;
}

interface ValidationComplete {
  _tag: 'complete';
  result: components['schemas']['TraitTSVValidationResponse'];
}

type ExternalValidationState = ValidationNotStarted | ValidationInProgress | ValidationComplete | ValidationHttpError;

const parseTsv = (tsv: string): string[][] => tsv.replace(/\r/g, '').split('\n').map(line => line.split('\t'));

@Component({
  selector: 'laji-trait-db-data-entry-validate',
  templateUrl: './data-entry-validate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEntryValidateComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input({ required: true }) datasetId!: string;
  @Input({ required: true }) tsv!: string;

  @Output() validationSuccess = new EventEmitter<null>();

  @ViewChild('cellTemplate') cellTemplate!: TemplateRef<any>;

  validationState$ = new BehaviorSubject<ExternalValidationState>({ _tag: 'not-started' });
  table$ = new Subject<{ rows: any; cols: any }>();
  objectEntries = Object.entries;

  private tsvChange = new BehaviorSubject<null>(null);

  constructor(
    private api: LajiApiClientBService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    this.validationSuccess.emit();
  }

  ngAfterViewInit() {
    this.tsvChange.subscribe(() => {
      // populate datatable with tsv
      const arr = parseTsv(this.tsv);
      this.table$.next({
        cols: arr[0]
          .map((heading, idx) => ({
            title: heading,
            prop: idx+'',
            cellTemplate: this.cellTemplate
          })),
        rows: arr
          .slice(1)
          .map(row => row
            .reduce((acc, cell, idx) => { acc[idx] = cell; return acc; }, {} as any)
          )
      });

      // validate tsv
      const query = {
        datasetId: this.datasetId,
        personToken: this.userService.getToken()
      };
      this.validationState$.next({ _tag: 'in-progress' });
      this.api.fetch('/trait/rows/tsv2rows/validate', 'post', { query }, this.tsv)
        .subscribe(
          res => {
            this.validationState$.next({ _tag: 'complete', result: res });
            this.cdr.markForCheck();
          },
          err => {
            console.error(err);
            this.validationState$.next({ _tag: 'http-error', error: JSON.stringify(err) });
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

