import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import { DatatableComponent } from '../../../shared-modules/datatable/datatable/datatable.component';
import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';
import { FormService } from '../../../shared/service/form.service';
import { FormField } from '../model/form-field';
import { SpreadSheetService } from '../service/spread-sheet.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'laji-importer',
  templateUrl: './importer.component.html',
  styleUrls: ['./importer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImporterComponent implements OnInit {

  @ViewChild(ModalDirective) mappingModal: ModalDirective;
  @ViewChild('dataTable') public datatable: DatatableComponent;

  data: {[key: string]: any}[];
  parsedData: {document: Document, rows: {[row: number]: {[level: string]: number}}}[];
  header: {[key: string]: string};
  fields: {[key: string]: FormField};
  dataColumns: ObservationTableColumn[];
  colMap: {[key: string]: string};
  formID: string;
  form: any;
  bstr: string;
  status: 'empty'|'importingFile'|'colMapping'|'dataMapping'|'importReady'|'validating'|'importing'|'doneOk'|'doneWithErrors' = 'empty';

  constructor(
    private formService: FormService,
    private spreadSheetService: SpreadSheetService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
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
    this.status = 'importingFile';
    const fileName = evt.target.value;
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      this.bstr = e.target.result;
      this.formID = this.spreadSheetService.findFormIdFromFilename(fileName);
      this.initForm();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  initForm() {
    if (!this.formID) {
      this.cdr.markForCheck();
      return;
    }
    this.formService.getForm(this.formID, this.translateService.currentLang)
      .subscribe(form => {
        const workBook: XLSX.WorkBook = XLSX.read(this.bstr, {type: 'binary', cellDates: true});
        const sheetName: string = workBook.SheetNames[0];
        const sheet: XLSX.WorkSheet = workBook.Sheets[sheetName];

        this.bstr = undefined;
        this.spreadSheetService.setDateFormat(sheet);
        const data = XLSX.utils.sheet_to_json<{[key: string]: string}>(sheet, {header: 'A'});

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
    const columns: ObservationTableColumn[] = [{
      prop: 'status', label: 'status', sortable: false, width: 55
    }];
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
  }

  colMappingDone(mapping) {
    this.status = 'dataMapping';
    this.colMap = mapping;
  }

  rowMappingDone() {
    this.status = 'importReady';
    this.mappingModal.hide();
    this.cdr.markForCheck();
  }

  validate() {
    // this.status = 'validating';
    this.parsedData = this.spreadSheetService.flatFieldsToDocuments(this.data, this.colMap, this.fields);
  }

}
