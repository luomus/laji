import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ILabelField, ILabelPdf, ISetup, PresetSetup, QRCodeErrorCorrectionLevel } from '../../label-designer.interface';
import { LocalStorage } from 'ngx-webstorage';
import { LabelPrintComponent } from '../../label-print/label-print.component';
import { InfoWindowService } from '../../info-window/info-window.service';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { TranslateService } from '../../translate/translate.service';
import { LabelMakerFacade } from '../label-maker.facade';
import { take } from 'rxjs/operators';
import { LabelDesignerHelper } from '../../label-designer.helper';

export interface ILoadSetup {
  setup: ISetup;
  filename: string;
  availableFields?: ILabelField[];
}

interface ISaveData {
  file: string;
  includeData: boolean;
}

/**
 * @internal
 */
@Component({
  selector: 'll-label-file',
  templateUrl: './label-file.component.html',
  styleUrls: ['./label-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelFileComponent {

  @Input() newSetup?: ISetup;
  @Input({ required: true }) setup!: ISetup;
  @Input() data?: Record<string, any>[];
  @Input({ required: true }) defaultAvailableFields!: ILabelField[];
  @Input({ required: true }) availableFields!: ILabelField[];
  @Input() pdfLoading = false;
  @Input() qrCodeErrorCorrectionLevel: QRCodeErrorCorrectionLevel = QRCodeErrorCorrectionLevel.levelM;
  @Input() presets?: PresetSetup[];
  @Input() allowLabelItemRepeat = false;

  @LocalStorage('recent-files', []) recentFiles!: {setup: ISetup; filename: string; availableFields: ILabelField[]}[];

  @Output() html = new EventEmitter<ILabelPdf>();
  @Output() dataChange = new EventEmitter<Record<string, any>[]>();
  @Output() setupChange = new EventEmitter<ISetup>();
  @Output() availableFieldsChange = new EventEmitter<ILabelField[]>();
  @Output() pdfLoadingChange = new EventEmitter<boolean>();
  @ViewChild('printBtn', { static: true }) printBtn!: LabelPrintComponent;
  @ViewChild('saveTpl', { static: true }) saveTpl!: TemplateRef<any>;
  @ViewChild('saveActionsTpl', { static: true }) saveActionsTpl!: TemplateRef<any>;
  @ViewChild('makePdfTpl', { static: true }) makePdfTpl!: TemplateRef<any>;
  @ViewChild('makePdfActionsTpl', { static: true }) makePdfActionsTpl!: TemplateRef<any>;

  filename = '';
  saveData: ISaveData = {
    file: '',
    includeData: false
  };
  pdfFile = '';
  skip = 0;
  repeat = 1;

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
    this.filename = target.files[0].name;
    const error = () => {
      evt.target.value = '';
      this.labelMakerFacade.loadedFile('');
      alert(this.translateService.get('Could not find label information from the file!'));
    };

    if (this.filename.endsWith('.label')) {
      JSZip.loadAsync(target.files[0])
        .then(content => content.files['data.json'].async('text'))
        .then(jsonString => {
          evt.target.value = '';
          const data = JSON.parse(jsonString);
          if (data && data.setup) {
            LabelDesignerHelper.mergeFieldsToSetup(this.defaultAvailableFields, data.setup);
            this.setupChange.emit(data.setup);
            this.updateResentFiles({setup: data.setup, availableFields: data.fields}, this.filename);
            if (data.fields && Array.isArray(data.fields)) {
              this.availableFieldsChange.emit(data.fields);
              this.labelMakerFacade.loadedFile(this.filename);
            }
            if (data.data && Array.isArray(data.data)) {
              this.dataChange.emit(data.data);
            }
          } else {
            error();
          }
        })
        .catch(() => {
          error();
        });
    } else {
      error();
    }
  }

  save() {
    this.infoWindowService.open({
      title: this.translateService.get('Save to file'),
      content: this.saveTpl,
      actions: this.saveActionsTpl
    });
  }

  doSave(): void {
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
        .then(function(blob) {
          saveAs(blob, filename);
        });
    }
    this.saveData = {
      file: '',
      includeData: false
    };
    this.labelMakerFacade.hasChanges(false);
  }

  print(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }
    this.infoWindowService.open({
      title: this.translateService.get('Download labels (pdf)'),
      content: this.makePdfTpl,
      actions: this.makePdfActionsTpl
    });
  }

  doPrint(): void {
    this.infoWindowService.close();
    this.printBtn.renderPages({
      skip: this.skip,
      repeat: this.repeat
    });
  }

  removeRecent(idx: number): void {
    this.recentFiles = [
      ...this.recentFiles.slice(0, idx),
      ...this.recentFiles.slice(idx + 1),
    ];
  }

  makeNew(): void {
    if (confirm(this.translateService.get('Are you sure that you want to start a new empty label?'))) {
      this.labelMakerFacade.loadedFile('');
      this.setupChange.emit(JSON.parse(JSON.stringify(this.newSetup)));
    }
  }

  updateSaveData<K extends keyof ISaveData, T extends ISaveData[K]>(key: K, value: T): void {
    this.saveData = {
      ...this.saveData,
      [key]: value
    };
  }

  loadSetup(recent: ILoadSetup | PresetSetup): void {
    this.labelMakerFacade.hasChanges$.pipe(take(1)).subscribe(
      (hasChanges) => {
        if (hasChanges && !confirm(this.translateService.get('Do you want to discard the local changes?'))) {
          return;
        }
        LabelDesignerHelper.mergeFieldsToSetup(this.defaultAvailableFields, recent.setup);
        this.setupChange.emit(recent.setup);
        if (recent.availableFields) {
          this.availableFieldsChange.emit(recent.availableFields);
        }
        this.labelMakerFacade.loadedFile((recent as ILoadSetup).filename || (recent as PresetSetup).name);
      });
  }

  startPdfLoading(): void {
    if (this.pdfLoading) {
      return;
    }
    this.pdfLoadingChange.emit(true);
  }

  onHtml(html: string): void {
    this.html.emit({
      filename: this.pdfFile.endsWith('.pdf') ? this.pdfFile : this.pdfFile + '.pdf',
      html
    });
  }

  private updateResentFiles(data: {setup: ISetup; availableFields: ILabelField[]}, filename: string): void {
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
}
