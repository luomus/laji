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

enum SubmissionState { NotStarted, Submitting, Ready }

@Component({
  templateUrl: './trait-db-data-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stringCell') stringCell!: TemplateRef<any>;

  @Output() submissionSuccess = new EventEmitter();

  tableData$ = new BehaviorSubject<TableData | null>(null);
  submissionState$ = new BehaviorSubject<SubmissionState>(SubmissionState.NotStarted);

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
          const columns = ([...subjectCols, ...traitColsAcc] as [string, LeafType][])
            .map(
              ([prop, _]) => ({
                title: prop as string,
                prop: prop as string,
                sortable: false,
                cellTemplate: this.stringCell
              } as DatatableColumn<any>)
            );

          const formArray = this.constructFormArray(rows);
          return {
            rows: formArray,
            cols: columns
          };
        })
      ).subscribe(data => {
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

  onSubmit() {
    this.tableData$.pipe(
      filter(data => !!data),
      tap(_ => {
        this.submissionState$.next(SubmissionState.Submitting);
      }),
      switchMap(data => this.api.fetch(
        '/trait/rows/multi',
        'post',
        { query: { personToken: this.userService.getToken() } },
        data!.rows.value
      ))
    ).subscribe(
      (res) => {
        console.log('changes saved!', res);
        this.submissionSuccess.emit();
      },
      err => {
        console.error(err);
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

