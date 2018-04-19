import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { DatatableComponent } from '../../../shared-modules/datatable/datatable/datatable.component';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { Document } from '../../../shared/model';
import { FormService } from '../../../shared/service/form.service';
import { FormField } from '../model/form-field';
import { ImportService } from '../service/import.service';
import { MappingService } from '../service/mapping.service';
import { SpreadSheetService } from '../service/spread-sheet.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastsService } from '../../../shared/service/toasts.service';
import { AugmentService } from '../service/augment.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { LocalStorage } from 'ng2-webstorage';
import * as Hash from 'object-hash';

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

  @ViewChild('currentUserMapModal') currentUserMapModal: ModalDirective;
  @ViewChild('userMapModal') userMapModal: ModalDirective;
  @ViewChild('dataTable') datatable: DatatableComponent;
  @ViewChild('rowNumber') rowNumberTpl: TemplateRef<any>;
  @ViewChild('statusCol') statusColTpl: TemplateRef<any>;

  @LocalStorage() uploadedFiles;
  @LocalStorage() partiallyUploadedFiles;

  data: {[key: string]: any}[];
  parsedData: {document: Document, skipped: number[], rows: {[row: number]: {[level: string]: number}}}[];
  header: {[key: string]: string};
  fields: {[key: string]: FormField};
  dataColumns: ObservationTableColumn[];
  colMap: {[key: string]: string};
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
  maxUnits = ImportService.maxPerDocument;
  hash;

  constructor(
    private formService: FormService,
    private spreadSheetService: SpreadSheetService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private importService: ImportService,
    private mappingService: MappingService,
    private toastsService: ToastsService,
    private augmentService: AugmentService,
    private dialogService: DialogService
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
    reader.onload = (e: any) => {
      evt.target.value = '';
      this.valid = false;
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
    }
  }

  initForm() {
    if (!this.formID) {
      this.cdr.markForCheck();
      return;
    }
    this.formService.getForm(this.formID, this.translateService.currentLang)
      .subscribe(form => {
        const [data, sheet] = this.spreadSheetService.loadSheet(this.bstr);
        this.bstr = undefined;
        this.hash = Hash.sha1(data);

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
        this.colMap = this.spreadSheetService.getColMapFromComments(sheet, this.fields, Object.keys(this.header).length);

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
    const columns: ObservationTableColumn[] = [
      {prop: '_status', label: 'status', sortable: false, width: 65, cellTemplate: this.statusColTpl},
      {prop: '_idx', label: '#', sortable: false, width: 40, cellTemplate: this.rowNumberTpl}
    ];
    Object.keys(this.header).map(address => {
      columns.push({prop: address, label: this.header[address], sortable: false})
    });
    this.dataColumns = columns;
    setTimeout(() => {
      this.datatable.refreshTable();
    }, 200);
  }

  formSelected(event) {
    this.formID = event.id;
    this.initForm();
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

  rowMappingDone(mappings) {
    this.status = 'importReady';
    this.hasUserMapping = this.mappingService.hasUserMapping();
    this.mappingService.addUserValueMapping(mappings);
    this.initParsedData();
    const skipped = [];
    if (this.parsedData) {
      this.parsedData.forEach(data => skipped.push(...data.skipped));
    }
    this.data = [...this.data.map((row, idx) => ({...row, _status: skipped.indexOf(idx) !== -1 ? {status: 'ignore'} : undefined}))];
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  validate() {
    this.status = 'validating';
    let success = true;
    Observable.from(this.parsedData)
      .mergeMap(data => this.augmentService.augmentDocument(data.document, this.excludedFromCopy)
        .switchMap(document => this.importService.validateData(document))
        .switchMap(result => Observable.of({result: result, source: data}))
        .catch(err => Observable.of(typeof err.json === 'function' ? err.json() : err)
          .map(body => body.error && body.error.details || body)
          .map(error => ({result: {_error: error}, source: data}))
        )
      )
      .subscribe(
        (data) => {
          if (data.result._error) {
            success = false;
            Object.keys(data.source.rows).forEach(key => this.data[key]['_status'] = {
              status: 'invalid',
              error: data.result._error
            });
          } else {
            Object.keys(data.source.rows).forEach(key => this.data[key]['_status'] = {});
          }
          this.data = [...this.data];
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
    Observable.from(this.parsedData)
      .mergeMap(data => this.augmentService.augmentDocument(data.document)
        .switchMap(document => this.importService.sendData(document, publicityRestrictions))
        .switchMap(result => Observable.of({result: result, source: data}))
        .catch(err => Observable.of(err.json())
          .map(body => body.error && body.error.details || body)
          .map(error => ({result: {_error: error}, source: data}))
        )
      )
      .subscribe(
        (data) => {
          if (data.result._error) {
            success = false;
            Object.keys(data.source.rows).forEach(key => this.data[key]['_status'] = {
              status: 'error',
              error: data.result._error
            });
          } else {
            hadSuccess = true;
            Object.keys(data.source.rows).forEach(key => this.data[key]['_status'] = {status: 'ok'});
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
            this.toastsService.showSuccess('Havaintoerät tallennettu');
            this.valid = true;
            this.uploadedFiles = [...this.partiallyUploadedFiles, this.hash];
          } else {
            if (hadSuccess) {
              this.partiallyUploadedFiles = [...this.partiallyUploadedFiles, this.hash];
            }
            this.status = 'doneWithErrors';
            this.toastsService.showError('Kaikkia havaintoeriä ei onnistuttu tallentamaan!');
          }
          this.cdr.markForCheck();
        }
      );
  }

  initParsedData() {
    if (!this.parsedData) {
      this.parsedData = this.importService.flatFieldsToDocuments(this.data, this.colMap, this.fields, this.formID);
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
    this.status = status;
    this.cdr.markForCheck();
  }

}
