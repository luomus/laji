import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { UserService } from '../../../shared/service/user.service';
import { map, tap, filter, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { components } from 'projects/laji-api-client-b/generated/api';
import { cols as subjectCols } from './data-editor-search-table-columns';
import { cols as traitCols } from './data-editor-search-table-columns-traits';
import { FooterService } from '../../../shared/service/footer.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LeafType } from 'scripts/codegen/shared';
import { DatatableColumn } from 'projects/laji-ui/src/lib/datatable/datatable.component';

type InputRow = components['schemas']['InputRow'];

interface TableData {
  rows: FormArray<FormGroup>;
  cols: DatatableColumn<any>[];
}

interface RowUploadInProgress {
  _tag: 'in-progress';
}

interface RowUploadComplete {
  _tag: 'complete';
}

interface RowUploadError {
  _tag: 'error';
  msg: string;
}

interface RowDeletionInProgress {
  _tag: 'deleting';
}

type RowUploadState = RowUploadInProgress | RowUploadComplete | RowUploadError | RowDeletionInProgress;

@Component({
  templateUrl: './trait-db-data-editor.component.html',
  styleUrls: ['./trait-db-data-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stringCell') stringCell!: TemplateRef<any>;
  @ViewChild('numberCell') numberCell!: TemplateRef<any>;
  @ViewChild('booleanCell') booleanCell!: TemplateRef<any>;
  @ViewChild('enumCell') enumCell!: TemplateRef<any>;
  @ViewChild('editCell') editCell!: TemplateRef<any>;

  @Output() submissionSuccess = new EventEmitter();

  tableData$ = new BehaviorSubject<TableData | null>(null);
  rowUploadState$ = new BehaviorSubject<Record<number, RowUploadState>>({});

  private viewInit$ = new Subject<void>();
  private datasetId$: Observable<string>;
  private sub = new Subscription();

  constructor(
    private api: LajiApiClientBService,
    private userService: UserService,
    private route: ActivatedRoute,
    private footerService: FooterService,
    private fb: FormBuilder
  ) {
    this.datasetId$ = this.route.params.pipe(map(params => params['id']), filter(v => v !== undefined));
  }

  ngOnInit() {
    this.sub.add(
      combineLatest(
        this.datasetId$,
        this.userService.isLoggedIn$.pipe(filter(state => !!state)),
        this.viewInit$
      ).pipe(
        switchMap(([datasetId, _0, _1]) => this.api.fetch('/trait/rows/search', 'get', {
          query: { datasetId, pageSize: 1000, personToken: this.userService.getToken() } })
        ),
        map(rows => {
          const traitColsAcc: [string, LeafType][] = [];
          rows[0].traits?.forEach((trait, idx) => {
            traitColsAcc.push(...traitCols.map(([name, node]) => ([`traits.${idx}.${name}`, node] as [string, LeafType])));
          });
          const columns: DatatableColumn<any>[] = [{
            title: '',
            sortable: false,
            unselectable: false,
            cellTemplate: this.editCell
          } as DatatableColumn<any>];
          columns.push(...([...subjectCols, ...traitColsAcc] as [string, LeafType][])
            .map(
              ([prop, colType]) => {
                switch (colType._tag) {
                  case 'enum':
                    return ({
                      title: prop as string,
                      prop: prop as string,
                      sortable: false,
                      cellTemplate: this.enumCell,
                      variants: colType.variants
                    } as DatatableColumn<any>);
                  case 'number':
                    return ({
                      title: prop as string,
                      prop: prop as string,
                      sortable: false,
                      cellTemplate: this.numberCell,
                    } as DatatableColumn<any>);
                  case 'boolean':
                    return ({
                      title: prop as string,
                      prop: prop as string,
                      sortable: false,
                      cellTemplate: this.booleanCell,
                    } as DatatableColumn<any>);
                  default:
                    return ({
                      title: prop as string,
                      prop: prop as string,
                      sortable: false,
                      cellTemplate: this.stringCell
                    } as DatatableColumn<any>);
                }
              }
            )
          );

          const formArray = this.constructFormArray(rows);
          return {
            rows: formArray,
            cols: columns
          };
        })
      ).subscribe(data => {
        // There's a potential memory leak with this subscription if the datasetId$ changes,
        // however, it all gets cleaned up upon ngOnDestroy so it's not worth worrying about imo...
        this.sub.add(
          this.rowUploadState$.subscribe(state => {
            Object.entries(state).forEach(([rowIdx, rowState]) => {
              if (rowState._tag === 'in-progress') {
                data.rows.at(+rowIdx).disable({ emitEvent: false });
              } else {
                data.rows.at(+rowIdx).enable({ emitEvent: false });
              }
            });
          })
        );
        this.tableData$.next(data);
      })
    );

    this.footerService.footerVisible = false;
  }

  ngAfterViewInit() {
    this.viewInit$.next();
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
    this.viewInit$.complete();
  }

  onSubmitRow(row: FormGroup<any>, rowIdx: number) {
    const params = {
      path: { id: row.get(['subject', 'id'])!.value },
      query: { personToken: this.userService.getToken() }
    };
    this.rowUploadState$.next({ ...this.rowUploadState$.value, [rowIdx]: { _tag: 'in-progress' } });
    this.api.fetch('/trait/rows/{id}', 'put', params, row.value).subscribe(
      (res) => {
        console.log('result: ', res);
        this.rowUploadState$.next({ ...this.rowUploadState$.value, [rowIdx]: { _tag: 'complete' } });
      },
      err => {
        console.error(err);
        const msg = `Status: ${err?.error?.status}, Message: ${err?.error?.message}`;
        this.rowUploadState$.next({ ...this.rowUploadState$.value, [rowIdx]: { _tag: 'error', msg } });
      }
    );
  }

  onDeleteRow(row: FormGroup<any>, rowIdx: number) {
    const params = {
      path: { id: row.get(['subject', 'id'])!.value },
      query: { personToken: this.userService.getToken() }
    };
    this.rowUploadState$.next({ ...this.rowUploadState$.value, [rowIdx]: { _tag: 'deleting' } });
    this.api.fetch('/trait/rows/{id}', 'delete', params).subscribe(
      _ => {
        this.tableData$.value?.rows.removeAt(rowIdx);
        // shift all following indices down by 1
        const currentState = this.rowUploadState$.value;
        const newState = {} as Record<number, RowUploadState>;
        Object.entries(currentState).forEach(([idx, state]) => {
          if (+idx > rowIdx) {
            newState[(+idx) - 1] = state;
          } else if (+idx < rowIdx) {
            newState[+idx] = state;
          }
        });
        this.rowUploadState$.next(newState);
      },
      err => {
        console.error(err);
        const msg = `Status: ${err?.error?.status}, Message: ${err?.error?.message}`;
        this.rowUploadState$.next({ ...this.rowUploadState$.value, [rowIdx]: { _tag: 'error', msg } });
      }
    );
  }

  private constructFormArray(rows: InputRow[]): FormArray<FormGroup> {
    const formArray = this.fb.array([] as FormGroup[]);
    rows.forEach(row => {
      const subjectFormControls = {} as Record<keyof typeof row.subject, FormControl<any>>;
      Object.entries(row.subject).forEach(([key, value]) => {
        subjectFormControls[key as keyof typeof row.subject] = new FormControl(value);
      });
      const subject = this.fb.group(subjectFormControls);
      const traits = this.fb.array(
        row.traits?.map(trait => this.fb.group(
          Object.entries(trait).reduce(
            (prev, [key, value]) => {
              prev[key] = new FormControl(value);
              return prev;
            }, {} as any
          )
        ))
        ?? [] as FormGroup[]);
      formArray.push(this.fb.group({ subject, traits }));
    });
    return formArray;
  }
}

