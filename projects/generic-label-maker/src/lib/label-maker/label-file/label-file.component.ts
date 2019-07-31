import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ILabelField, ISetup, PresetSetup, QRCodeErrorCorrectionLevel } from '../../generic-label-maker.interface';
import { LocalStorage } from 'ngx-webstorage';
import { LabelPrintComponent } from '../../label-print/label-print.component';
import { InfoWindowService } from '../../info-window/info-window.service';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { TranslateService } from '../../translate/translate.service';
import { LabelMakerFacade } from '../label-maker.facade';
import { take } from 'rxjs/operators';

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
  @Input() pdfLoading = false;
  @Input() qrCodeErrorCorrectionLevel: QRCodeErrorCorrectionLevel = QRCodeErrorCorrectionLevel.levelM;
  @Input() presets: PresetSetup[];

  @LocalStorage('recent-files', []) recentFiles: {setup: ISetup, filename: string, availableFields: ILabelField[]}[];

  @Output() html = new EventEmitter<string>();
  @Output() dataChange = new EventEmitter<object[]>();
  @Output() setupChange = new EventEmitter<ISetup>();
  @Output() availableFieldsChange = new EventEmitter<ILabelField[]>();
  @Output() pdfLoadingChange = new EventEmitter<boolean>();
  @ViewChild('printBtn', { static: true }) printBtn: LabelPrintComponent;
  @ViewChild('saveTpl', { static: true }) saveTpl: TemplateRef<any>;
  @ViewChild('saveActionsTpl', { static: true }) saveActionsTpl: TemplateRef<any>;

  filename = '';
  saveData = {
    file: '',
    includeData: false
  };

  constructor(
    private infoWindowService: InfoWindowService,
    private translateService: TranslateService,
    private labelMakerFacade: LabelMakerFacade
  ) { }

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
        version: 1,
        setup: this.setup,
        fields: this.availableFields,
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
      includeData: false
    };
    this.labelMakerFacade.hasChanges(false);
  }

  print() {
    this.printBtn.renderPages();
  }

  private updateResentFiles(data: {setup: ISetup, availableFields: ILabelField[]}, filename: string) {
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
    if (confirm(this.translateService.get('Are you sure that you want to start a new empty label?'))) {
      this.setupChange.emit(JSON.parse(JSON.stringify(this.newSetup)));
    }
  }

  updateSaveData(key: string, value: any) {
    this.saveData = {
      ...this.saveData,
      [key]: value
    };
  }

  loadSetup(recent: { setup: ISetup; filename: string; availableFields?: ILabelField[] } | PresetSetup) {
    this.labelMakerFacade.hasChanges$.pipe(take(1)).subscribe(
      (hasChanges) => {
        if (hasChanges && !confirm(this.translateService.get('Do you want to discard the local changes?'))) {
          return;
        }
        this.setupChange.emit(recent.setup);
        if (recent.availableFields) {
          this.availableFieldsChange.emit(recent.availableFields);
        }
        this.labelMakerFacade.hasChanges(false);
      });
  }

  startPdfLoading() {
    if (this.pdfLoading) {
      return;
    }
    this.pdfLoadingChange.emit(true);
  }
}
