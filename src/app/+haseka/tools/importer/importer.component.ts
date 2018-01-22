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

type states
  = 'empty'
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

  @ViewChild(ModalDirective) mappingModal: ModalDirective;
  @ViewChild('dataTable') datatable: DatatableComponent;
  @ViewChild('rowNumber') rowNumberTpl: TemplateRef<any>;

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

  constructor(
    private formService: FormService,
    private spreadSheetService: SpreadSheetService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private importService: ImportService,
    private mappingService: MappingService
  ) { }

  ngOnInit() {
    this.status = 'empty';
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
      this.valid = false;
      this.errors = undefined;
      this.parsedData = undefined;
      this.bstr = e.target.result;
      this.formID = this.spreadSheetService.findFormIdFromFilename(fileName);
      this.initForm();
    };
    if (this.spreadSheetService.isValidType(target.files[0].type)) {
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
        this.fields = this.spreadSheetService.formToFlatFieldsLookUp(form, true);
        this.colMap = this.spreadSheetService.getColMapFromComments(sheet, this.fields);

        this.initDataColumns();
        this.status = 'colMapping';
        this.mappingModal.show();
        this.cdr.markForCheck();
      });
  }

  initDataColumns() {
    if (!this.header) {
      return;
    }
    const columns: ObservationTableColumn[] = [
      {prop: 'status', label: 'status', sortable: false, width: 55},
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
    this.mappingModal.hide();
    this.mappingService.addUserValueMapping(mappings);
    this.cdr.markForCheck();
  }

  validate() {
    this.status = 'validating';
    this.initParsedData();
    const validationObservation = Observable.from(this.parsedData)
      .mergeMap(data => this.importService.validateData(data.document))
      .subscribe(
        () => {
          this.status = 'importReady';
          this.valid = true;
          this.cdr.markForCheck();
        },
        (err) => {
          const body = err.json();
          if (body.error && body.error.details) {
            this.errors = body.error.details;
          }
          this.status = 'importReady';
          this.cdr.markForCheck();
        }
      );
  }

  save(publicityRestrictions: Document.PublicityRestrictionsEnum) {
    this.status = 'importing';
    this.initParsedData();
    const validationObservation = Observable.from(this.parsedData)
      .mergeMap(data => this.importService.sendData(data.document, publicityRestrictions))
      .subscribe(
        () => {
          this.status = 'doneOk';
          this.valid = true;
          this.cdr.markForCheck();
        },
        (err) => {
          const body = err.json();
          if (body.error && body.error.details) {
            this.errors = body.error.details;
          }
          this.status = 'doneWithErrors';
          this.cdr.markForCheck();
        }
      );
  }

  initParsedData() {
    if (!this.parsedData) {
      this.parsedData = this.spreadSheetService.flatFieldsToDocuments(this.data, this.colMap, this.fields, this.formID);
    }
  }

}
