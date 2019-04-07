import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ILabelField, ISetup } from '../../generic-label-maker.interface';
import { LocalStorage } from 'ngx-webstorage';
import { LabelPrintComponent } from '../../label-print/label-print.component';
import { InfoWindowService } from '../../info-window/info-window.service';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

@Component({
  selector: 'll-label-file',
  templateUrl: './label-file.component.html',
  styleUrls: ['./label-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelFileComponent {

  @Input() newSetup: ISetup;
  @Input() setup: ISetup;
  @Input() data: object[];
  @Input() availableFields: ILabelField[];

  @LocalStorage('recent-files', []) recentFiles: {setup: ISetup, filename: string, availableFields?: ILabelField[]}[];

  @Output() html = new EventEmitter<string>();
  @Output() dataChange = new EventEmitter<object[]>();
  @Output() setupChange = new EventEmitter<ISetup>();
  @Output() availableFieldsChange = new EventEmitter<ILabelField[]>();
  @ViewChild('printBtn') printBtn: LabelPrintComponent;
  @ViewChild('saveTpl') saveTpl: TemplateRef<any>;
  @ViewChild('saveActionsTpl') saveActionsTpl: TemplateRef<any>;

  filename = '';
  saveData = {
    file: '',
    includeData: false,
    includeFields: false
  };

  constructor(private infoWindowService: InfoWindowService) { }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length < 1) {
      return;
    }
    const genericError = 'Could not find label information from the file!';
    this.filename = target.files[0].name;
    if (this.filename.endsWith('.label')) {
      JSZip.loadAsync(target.files[0])
        .then(content => content.files['data.json'].async('text'))
        .then(jsonString => {
          evt.target.value = '';
          const data = JSON.parse(jsonString);
          if (data && data.setup) {
            this.setupChange.emit(data.setup);
            this.updateResentFiles({setup: data.setup, availableFields: data.fields}, this.filename);
            if (data.fields && Array.isArray(data.fields)) {
              this.availableFieldsChange.emit(data.fields);
            }
            if (data.data && Array.isArray(data.data)) {
              this.dataChange.emit(data.data);
            }
          } else {
            evt.target.value = '';
            alert(genericError);
          }
        })
        .catch(() => {
          evt.target.value = '';
          alert(genericError);
        });
    } else {
      evt.target.value = '';
      alert(genericError);
    }
  }

  save() {
    this.infoWindowService.open({
      title: 'Save to file',
      content: this.saveTpl,
      actions: this.saveActionsTpl
    });
  }

  doSave() {
    this.infoWindowService.close();
    if (this.saveData.file) {
      const filename = this.saveData.file + (this.saveData.file.endsWith('.label') ? '' : '.label');
      const zip = new JSZip();
      const data = {
        setup: this.setup,
        fields: this.saveData.includeFields && this.availableFields ? this.availableFields : undefined,
        data: this.saveData.includeData && this.data ? this.data : undefined
      };
      zip.file('data.json', JSON.stringify(data));
      zip.generateAsync({type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 }})
        .then(function (blob) {
          saveAs(blob, filename);
        });
    }
    this.saveData = {
      file: '',
      includeFields: false,
      includeData: false
    };
  }

  print() {
    this.printBtn.renderPages();
  }

  private updateResentFiles(data: {setup: ISetup, availableFields?: ILabelField[]}, filename: string) {
    const idx = this.recentFiles.findIndex(i => i.filename === filename);
    if (idx === -1) {
      this.recentFiles = [
        {...data, filename},
        ...this.recentFiles.slice(-2)
      ];
    } else {
      this.recentFiles = [
        {...data, filename},
        ...this.recentFiles.slice(0, idx),
        ...this.recentFiles.slice(idx + 1),
      ];
    }
  }

  removeRecent(idx: number) {
    this.recentFiles = [
      ...this.recentFiles.slice(0, idx),
      ...this.recentFiles.slice(idx + 1),
    ];
  }

  makeNew() {
    if (confirm('Are you sure that you want to start a new empty label?')) {
      this.setupChange.emit(JSON.parse(JSON.stringify(this.newSetup)));
    }
  }

  updateSaveData(key: string, value: any) {
    this.saveData = {
      ...this.saveData,
      [key]: value
    };
  }

  loadRecent(recent: { setup: ISetup; filename: string; availableFields?: ILabelField[] }) {
    this.setupChange.emit(recent.setup);
    if (recent.availableFields) {
      this.availableFieldsChange.emit(recent.availableFields);
    }
  }
}
