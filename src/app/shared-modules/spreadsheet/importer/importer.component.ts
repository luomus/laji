import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from as ObservableFrom, of as ObservableOf } from 'rxjs';
import { DatatableComponent } from '../../datatable/datatable/datatable.component';
import { Document } from '../../../shared/model/Document';
import { FormService } from '../../../shared/service/form.service';
import { IFormField } from '../../../+haseka/tools/model/excel';
import { CombineToDocument, IDocumentData, ImportService } from '../service/import.service';
import { MappingService } from '../service/mapping.service';
import { SpreadSheetService } from '../service/spread-sheet.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastsService } from '../../../shared/service/toasts.service';
import { AugmentService } from '../service/augment.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { LocalStorage } from 'ngx-webstorage';
import * as Hash from 'object-hash';
import { ImportTableColumn } from '../../../+haseka/tools/model/import-table-column';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { ExcelToolService } from '../service/excel-tool.service';
import { LatestDocumentsFacade } from '../../latest-documents/latest-documents.facade';

export type States
  = 'empty'
  | 'fileAlreadyUploadedPartially'
  | 'fileAlreadyUploaded'
  | 'ambiguousColumns'
  | 'invalidFileType'
  | 'importingFile'
  | 'colMapping'
  | 'dataMapping'
  | 'importReady'
  | 'validating'
  | 'invalidData'
  | 'importing'
  | 'doneOk'
  | 'doneWithErrors';

@Component({
  selector: 'laji-importer',
  templateUrl: './importer.component.html',
  styleUrls: ['./importer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImporterComponent implements OnInit {

  @ViewChild('currentUserMapModal', { static: true }) currentUserMapModal: ModalDirective;
  @ViewChild('userMapModal', { static: true }) userMapModal: ModalDirective;
  @ViewChild('dataTable', { static: false }) datatable: DatatableComponent;
  @ViewChild('rowNumber', { static: true }) rowNumberTpl: TemplateRef<any>;
  @ViewChild('statusCol', { static: true }) statusColTpl: TemplateRef<any>;
  @ViewChild('valueCol', { static: true }) valueColTpl: TemplateRef<any>;

  @LocalStorage() uploadedFiles;
  @LocalStorage() partiallyUploadedFiles;
  @LocalStorage('importCombineBy', CombineToDocument.gathering) combineBy: CombineToDocument;
  @LocalStorage('importIncludeOnlyWithCount', false) onlyWithCount: boolean;

  data: {[key: string]: any}[];
  mappedData: {[key: string]: any}[];
  parsedData: IDocumentData[];
  header: {[key: string]: string};
  fields: {[key: string]: IFormField};
  dataColumns: ImportTableColumn[];
  docCnt = 0;
  origColMap: {[key: string]: string};
  colMap: {[key: string]: string};
  valueMap: {[key: string]: {[value: string]: any}} = {};
  formID: string;
  form: any;
  bstr: string;
  errors: any;
  valid = false;
  priv = Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate;
  publ = Document.PublicityRestrictionsEnum.publicityRestrictionsPublic;
  status: States = 'empty';
  filename = '';
  excludedFromCopy: string[] = [];
  userMappings: any;
  hasUserMapping = false;
  ambiguousColumns = [];
  separator = MappingService.valueSplitter;
  hash;
  currentTitle: string;
  fileLoading = false;
  total = 0;
  current = 0;

  combineOptions: CombineToDocument[] = [
    CombineToDocument.gathering,
    CombineToDocument.all,
    CombineToDocument.none
  ];

  private externalLabel = [
    'editors[*]',
    'gatheringEvent.leg[*]'
  ];

  constructor(
    private formService: FormService,
    private spreadSheetService: SpreadSheetService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private importService: ImportService,
    private mappingService: MappingService,
    private toastsService: ToastsService,
    private augmentService: AugmentService,
    private dialogService: DialogService,
    private excelToolService: ExcelToolService,
    private latestFacade: LatestDocumentsFacade
  ) { }

  ngOnInit() {
    this.status = 'empty';
    this.hasUserMapping = this.mappingService.hasUserMapping();
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) {
      this.status = 'empty';
      return;
    }
    const reader: FileReader = new FileReader();
    const fileName = evt.target.value;
    this.status = 'importingFile';
    this.fileLoading = true;
    reader.onload = (e: any) => {
      evt.target.value = '';
      this.valid = false;
      this.fileLoading = false;
      this.errors = undefined;
      this.parsedData = undefined;
      this.bstr = e.target.result;
      this.formID = this.spreadSheetService.findFormIdFromFilename(fileName);
      this.initForm();
    };
    if (this.spreadSheetService.isValidType(target.files[0].type)) {
      this.filename = target.files[0].name;
      reader.readAsArrayBuffer(target.files[0]);
    } else {
      this.status = 'invalidFileType';
      this.fileLoading = false;
    }
  }

  initForm() {
    if (!this.formID) {
      this.cdr.markForCheck();
      return;
    }
    this.formService.getForm(this.formID, this.translateService.currentLang)
      .subscribe(form => {
        this.form = form;
        this.combineOptions = this.excelToolService.getCombineOptions(form);
        const data = this.spreadSheetService.loadSheet(this.bstr);
        this.bstr = undefined;
        this.hash = Hash.sha1(data);

        if (this.combineOptions && this.combineOptions.length > 0 && this.combineOptions.indexOf(this.combineBy) === -1) {
          this.combineBy = this.combineOptions[0];
        }

        if (this.partiallyUploadedFiles && this.partiallyUploadedFiles.indexOf(this.hash) > -1) {
          this.status = 'fileAlreadyUploadedPartially';
          this.cdr.markForCheck();
          return;
        } else if (this.uploadedFiles && this.uploadedFiles.indexOf(this.hash) > -1) {
          this.status = 'fileAlreadyUploaded';
          this.cdr.markForCheck();
          return;
        }

        if (Array.isArray(data) || data[0]) {
          this.header = data.shift();
          this.data = data;
        }
        this.excludedFromCopy = form.excludeFromCopy || [];
        this.fields = this.spreadSheetService.formToFlatFieldsLookUp(form, true);
        this.colMap = this.spreadSheetService.getColMapFromSheet(this.header, this.fields);
        this.origColMap = JSON.parse(JSON.stringify(this.colMap));

        this.initDataColumns();

        // Check that data has no ambiguous columns
        const cols = Object.keys(this.header).map(key => this.header[key]);
        const hasCol = {};
        const ambiguousCols = new Set();
        let hasAmbiguousColumns = false;
        cols.forEach(col => {
          if (hasCol[col]) {
            hasAmbiguousColumns = true;
            ambiguousCols.add(col);
          } else {
            hasCol[col] = true;
          }
        });
        if (hasAmbiguousColumns) {
          this.status = 'ambiguousColumns';
          this.ambiguousColumns = Array.from(ambiguousCols);
        } else {
          this.status = 'colMapping';
        }
        this.cdr.markForCheck();
        setTimeout(() => {
          this.data = [...this.data];
          this.cdr.markForCheck();
        }, 1000);
      });
  }

  initDataColumns() {
    if (!this.header) {
      return;
    }
    this.translateService.get('excel.batch')
      .subscribe(label => {
        const rowLabel = this.translateService.instant('line');
        const columns: ImportTableColumn[] = [
          {prop: '_status', label: 'status', sortable: false, width: 65, cellTemplate: this.statusColTpl},
          {prop: '_doc', label: label, sortable: false, width: 40, cellTemplate: this.valueColTpl},
          {prop: '_idx', label: rowLabel, sortable: false, width: 40, cellTemplate: this.rowNumberTpl}
        ];
        Object.keys(this.header).map(address => {
          columns.push({
            prop: address,
            label: this.header[address],
            sortable: false,
            cellTemplate: this.valueColTpl,
            externalLabel: this.externalLabel.indexOf(this.colMap[address]) !== -1
          });
        });
        this.dataColumns = columns;
        setTimeout(() => {
          if (this.datatable) {
            this.datatable.refreshTable();
          }
        }, 200);
      });
  }

  formSelected(formID) {
    this.formID = formID;
    this.initForm();
  }

  hasButton(place: 'temp') {
    if (this.form && this.form.actions) {
      return typeof this.form.actions[place] !== 'undefined';
    }
    return true;
  }

  buttonLabel(place: 'save'|'temp') {
    if (this.form && this.form.actions && this.form.actions[place]) {
      return this.form.actions[place];
    }
    if (place === 'save') {
      return 'haseka.form.savePublic';
    }
    return 'haseka.form.savePrivate';
  }

  mapCol(event) {
    this.colMap = {...this.colMap, [event.col]: event.key};
    this.mappingService.addUserColMapping({[event.userValue]: event.key});
  }

  colMappingDone(mapping) {
    this.status = 'dataMapping';
    this.colMap = mapping;
    this.cdr.markForCheck();
  }

  rowMappingDone(mappings?) {
    this.status = 'importReady';
    if (mappings) {
      this.mappingService.addUserValueMapping(mappings);
    }
    this.hasUserMapping = this.mappingService.hasUserMapping();
    this.initParsedData();
    const skipped = [];
    const docs = {};
    if (this.parsedData) {
      let removed = 0;
      this.parsedData.forEach((data, idx) => {
        skipped.push(...data.skipped);
        const docNum = idx + 1;
        removed += data.document === null ? 1 : 0;
        Object.keys(data.rows).forEach(row => {
          docs[row] = docNum;
        });
      });

      this.docCnt = this.parsedData.length - removed;
    }
    this.mappedData = [
      ...this.data.map((row, idx) => ({
        ...this.getMappedValues(row, this.colMap, this.fields),
        _status: skipped.indexOf(idx) !== -1 ? {status: 'ignore'} : {status: 'valid'},
        _doc: docs[idx]
      }))
    ];
    setTimeout(() => {
      this.cdr.detectChanges();
    });
    this.validate();
  }

  changeImportType(value: any) {
    if (value === false || value === true || value === 'true' || value === 'false') {
      this.onlyWithCount = value === true || value === 'true';
    } else {
      this.combineBy = value;
    }
    this.parsedData = undefined;
    this.rowMappingDone();
  }

  validate() {
    this.status = 'validating';
    let success = true;
    this.total = this.parsedData.length;
    this.current = 1;
    ObservableFrom(this.parsedData.filter(data => data.document !== null)).pipe(
      concatMap(data => this.augmentService.augmentDocument(data.document, this.excludedFromCopy).pipe(
        concatMap(document => this.importService.validateData(document).pipe(
          switchMap(result => ObservableOf({result: result, source: data})),
          catchError(err => ObservableOf(typeof err.error !== 'undefined' ? err.error : err).pipe(
              map(body => body.error && body.error.details || body.error || body),
              map(error => ({result: {_error: error}, source: data}))
            ))
        )),
        tap(() => {
          if (this.current < this.total) {
            this.current++;
          }
          this.cdr.markForCheck();
        })
      )))
      .subscribe(
        (data) => {
          if (data.result._error) {
            success = false;
            Object.keys(data.source.rows).forEach(key => this.mappedData[key]['_status'] = {
              status: 'invalid',
              error: data.result._error
            });
          }
          this.mappedData = [...this.mappedData];
          this.cdr.markForCheck();
        },
        (err) => {
          const body = typeof err.json === 'function' ? err.json() : err;
          if (body.error && body.error.details) {
            this.errors = body.error.details;
          }
          this.valid = false;
          this.status = 'invalidData';
          this.cdr.markForCheck();
          console.error(err);
        },
        () => {
          this.valid = success;
          this.status = success ? 'importReady' : 'invalidData';
          this.cdr.markForCheck();
        }
      );
  }

  save(publicityRestrictions: Document.PublicityRestrictionsEnum) {
    this.status = 'importing';
    let success = true;
    let hadSuccess = false;
    this.total = this.parsedData.length;
    this.current = 1;
    ObservableFrom(this.parsedData.filter(data => data.document !== null)).pipe(
      concatMap(data => this.augmentService.augmentDocument(data.document).pipe(
        concatMap(document => this.importService.sendData(document, publicityRestrictions).pipe(
          switchMap(result => ObservableOf({result: result, source: data})),
          catchError(err => ObservableOf(typeof err.json === 'function' ? err.json() : err).pipe(
            map(body => body.error && body.error.details || body),
            map(error => ({result: {_error: error}, source: data}))
          ))
        )),
        tap(() => {
          if (this.current < this.total) {
            this.current++;
          }
          this.cdr.markForCheck();
        })
      )))
      .subscribe(
        (data) => {
          if (data.result._error) {
            success = false;
            Object.keys(data.source.rows).forEach(key => this.mappedData[key]['_status'] = {
              status: 'error',
              error: data.result._error
            });
          } else {
            hadSuccess = true;
            Object.keys(data.source.rows).forEach(key => this.mappedData[key]['_status'] = {status: 'ok'});
          }
          this.data = [...this.data];
          this.cdr.markForCheck();
        },
        (err) => {
          success = false;
          const body = err.json();
          if (body.error && body.error.details) {
            this.errors = body.error.details;
          }
          this.cdr.markForCheck();
        },
        () => {
          if (success) {
            this.status = 'doneOk';
            this.valid = true;
            this.uploadedFiles = this.uploadedFiles ? [...this.uploadedFiles, this.hash] : [this.hash];
            this.translateService.get('excel.import.done')
              .subscribe(msg => this.toastsService.showSuccess(msg));
          } else {
            if (hadSuccess) {
              this.partiallyUploadedFiles = this.partiallyUploadedFiles ? [...this.partiallyUploadedFiles, this.hash] : [this.hash];
            }
            this.status = 'doneWithErrors';
            this.toastsService.showError(this.translateService.instant('excel.import.failed'));
          }
          this.latestFacade.update();
          this.cdr.markForCheck();
        }
      );
  }

  initParsedData() {
    if (!this.parsedData) {
      this.parsedData = this.importService.flatFieldsToDocuments(
        this.data,
        this.colMap,
        this.fields,
        this.formID,
        this.onlyWithCount,
        this.combineBy
      );
    }
  }

  showUserMapping() {
    if (!this.hasUserMapping) {
      return;
    }
    this.userMappings = this.mappingService.getUserMappings();
    this.currentUserMapModal.show();
  }

  useUserMapping(value) {
    this.userMapModal.hide();
    try {
      this.mappingService.setUserMapping(JSON.parse(value));
    } catch (err) {
      console.log(err);
      this.toastsService.showWarning('Kuvausta ei tunnistettu!');
      return;
    }
    this.hasUserMapping = this.mappingService.hasUserMapping();
    if (this.hasUserMapping) {
      this.userColToColMap();
      this.parsedData = undefined;
    }
  }

  userColToColMap() {
    if (!this.header || !this.colMap) {
      return;
    }
    const result = {...this.header};
    Object.keys(result).forEach(key => {
      result[key] = this.mappingService.colMap(result[key]) || this.colMap[key];
    });
    this.colMap = result;
  }

  clearUserMapping() {
    if (!this.hasUserMapping) {
      return;
    }
    this.dialogService.confirm('Oletko varma että halut poistaa datan kuvauksen?')
      .subscribe((result) => {
        if (result) {
          this.status = 'empty';
          this.mappingService.clearUserMapping();
          this.hasUserMapping = this.mappingService.hasUserMapping();
        }
      });
  }

  activate(status) {
    if (status === 'dataMapping') {
      this.mappingService.clearUserValueMapping();
      this.valueMap = {};
    } else if (status === 'colMapping' || status === 'empty') {
      this.mappingService.clearUserColMapping();
      this.mappingService.clearUserValueMapping();
      this.colMap = JSON.parse(JSON.stringify(this.origColMap));
      this.valueMap = {};
      if (status === 'empty' && (this.status === 'doneOk' || this.status === 'doneWithErrors')) {
        this.filename = '';
      }
    }
    this.hasUserMapping = this.mappingService.hasUserMapping();
    this.status = status;
    this.cdr.markForCheck();
  }

  private getMappedValues(row, mapping, fields) {
    const cols = Object.keys(mapping);
    const result = {};
    cols.forEach((col) => {
      if (!row[col]) {
        return;
      }
      const field = fields[mapping[col]];
      const value = this.mappingService.getLabel(
        this.mappingService.map(this.mappingService.rawValueToArray(row[col], field), field, true),
        field
      );
      if (!this.importService.hasValue(value)) {
        return;
      }
      if (typeof value === 'object' && value[MappingService.mergeKey]) {
        result[col] = value[MappingService.mergeKey][Object.keys(value[MappingService.mergeKey])[0]];
      } else {
        result[col] = value;
      }
    });
    return result;
  }

  clearFile() {
    this.filename = '';
    this.bstr = undefined;
  }
}
