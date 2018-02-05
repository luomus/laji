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
import {ToastsService} from '../../../shared/service/toasts.service';
import {AugmentService} from '../service/augment.service';
import {DialogService} from '../../../shared/service/dialog.service';

type states
  = 'empty'
  | 'ambiguousColumns'
  | 'invalidFileType'
  | 'importingFile'
  | 'colMapping'
  | 'dataMapping'
  | 'importReady'
  | 'validating'
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
  @ViewChild('mappingModal') mappingModal: ModalDirective;
  @ViewChild('dataTable') datatable: DatatableComponent;
  @ViewChild('rowNumber') rowNumberTpl: TemplateRef<any>;
  @ViewChild('statusCol') statusColTpl: TemplateRef<any>;

  data: {[key: string]: any}[];
  parsedData: {document: Document, rows: {[row: number]: {[level: string]: number}}}[];
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
  status: states = 'empty';
  filename = '';
  excludedFromCopy: string[] = [];
  userMappings: any;
  hasUserMapping = false;
  ambiguousColumns = [];

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

        if (Array.isArray(data) || data[0]) {
          this.header = data.shift();
          this.data = data;
        }
        this.excludedFromCopy = form.excludeFromCopy || [];
        this.fields = this.spreadSheetService.formToFlatFieldsLookUp(form, true);
        this.colMap = this.spreadSheetService.getColMapFromComments(sheet, this.fields);

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
          this.mappingModal.show();
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
    this.mappingModal.hide();
    this.mappingService.addUserValueMapping(mappings);
    this.cdr.markForCheck();
  }

  validate() {
    this.status = 'validating';
    this.initParsedData();
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
          }
          this.data = [...this.data];
          this.cdr.markForCheck();
        },
        (err) => {
          const body = typeof err.json === 'function' ? err.json() : err;
          if (body.error && body.error.details) {
            this.errors = body.error.details;
          }
          this.cdr.markForCheck();
        },
        () => {
          this.valid = success;
          this.status = 'importReady';
          this.cdr.markForCheck();
        }
      );
  }

  save(publicityRestrictions: Document.PublicityRestrictionsEnum) {
    this.status = 'importing';
    this.initParsedData();
    let success = true;
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
          } else {
            this.status = 'doneWithErrors';
            this.toastsService.showError('Havaintoerien tallennus epäonnistui!');
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

  shouldCloseMapping() {
    this.dialogService.confirm('Haluatko varmasti keskeyttää?')
      .subscribe(result => {
        if (result) {
          this.mappingModal.hide();
        }
      })
  }

  showUserMapping() {
    if (!this.hasUserMapping) {
      return;
    }
    this.userMappings = this.mappingService.getUserMappings();
    this.currentUserMapModal.show();
  }

  useUserMapping(value) {
    try {
      this.mappingService.setUserMapping(JSON.parse(value));
    } catch (err) {
      console.log(err);
    }
    this.userMapModal.hide();
    this.hasUserMapping = this.mappingService.hasUserMapping();
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

}
