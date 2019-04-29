import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  FieldType,
  IAddLabelEvent,
  ILabelField,
  ILabelItem,
  ILabelValueMap,
  ISetup,
  IViewSettings
} from '../generic-label-maker.interface';
import { IPageLayout, LabelService } from '../label.service';
import { InfoWindowService } from '../info-window/info-window.service';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LabelExcelFileComponent } from './label-excel-file/label-excel-file.component';
import { GenericLabelMakerTranslationsInterface } from '../translate/generic-label-maker-translations.interface';
import { TranslateService } from '../translate/translate.service';

@Component({
  selector: 'll-label-maker',
  templateUrl: './label-maker.component.html',
  styleUrls: ['./label-maker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelMakerComponent implements OnInit, OnDestroy {

  static id = 0;

  @ViewChild('intro') intro;
  @ViewChild('gettingStarted') gettingStarted;

  _active: 'file'|'edit'|'view'|'settings'|'fields'|'help'|'close'|'map' = 'file';
  _setup: ISetup;
  _data: object[] = [];
  _selectedLabelItem: ILabelItem | undefined;
  _viewSettings: IViewSettings = {magnification: 2};
  generateFields: ILabelField[];
  dragging = false;
  version = '0.0.23';
  previewActive = 0;
  @Input() defaultDomain = '';
  @Input() newSetup: ISetup;
  @Input() newAvailableFields: ILabelField[];
  @Input() availableFields: ILabelField[];
  @Input() showIntro = true;
  @Input() pdfLoading = false;

  @Output() html = new EventEmitter<string>();
  @Output() viewSettingsChange = new EventEmitter<IViewSettings>();
  @Output() dataChange = new EventEmitter<object[]>();
  @Output() setupChange = new EventEmitter<ISetup>();
  @Output() introClosed = new EventEmitter();
  @Output() availableFieldsChange = new EventEmitter<ILabelField[]>();
  @Output() pdfLoadingChange = new EventEmitter<boolean>();
  @ViewChild('editor') editor: ElementRef<HTMLDivElement>;
  @ViewChild('generateTpl') generateTpl: TemplateRef<any>;
  @ViewChild('generateActionsTpl') generateActionsTpl: TemplateRef<any>;
  @ViewChild('excelFile') excelCmp: LabelExcelFileComponent;
  @ViewChild('excelTpl') excelTpl: TemplateRef<any>;
  @ViewChild('excelActionsTpl') excelActionsTpl: TemplateRef<any>;
  subIntro: Subscription;

  generate: {
    uri: string;
    rangeStart: number;
    rangeEnd: number;
    data: {[key: string]: string}
  } = {
    uri: '',
    rangeStart: undefined,
    rangeEnd: undefined,
    data: {}
  };

  dimensions: IPageLayout;

  private _undo: ISetup[] = [];
  private _redo: ISetup[] = [];

  constructor(
    private labelService: LabelService,
    private renderer2: Renderer2,
    private infoWindowService: InfoWindowService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (this.showIntro) {
      this.openIntro();
    }
  }

  ngOnDestroy(): void {
    if (this.subIntro) {
      this.subIntro.unsubscribe();
    }
  }

  @Input()
  set translations(translations: GenericLabelMakerTranslationsInterface) {
    this.translateService.setTranslations(translations);
  }

  @Input()
  set data(data: object[]) {
    if (!Array.isArray(data)) {
      data = [];
    }
    this._data = data;
    this.setPreviewActive(0);
  }

  get data() {
    return this._data;
  }

  @Input()
  set viewSettings(settings: IViewSettings) {
    if (!settings) {
      return;
    }
    if (isPlatformBrowser(this.platformId) && settings.fullscreen !== this._viewSettings.fullscreen) {
      try {
        if (settings.fullscreen) {
          const elem: any = this.editor.nativeElement;
          const enterMethod = elem.requestFullScreen || elem.webkitRequestFullScreen ||
            elem.mozRequestFullScreen || elem.msRequestFullScreen;
          if (enterMethod) {
            enterMethod.call(elem);
          }
        } else if (this._viewSettings.fullscreen) {
          const doc: any = document;
          const exitMethod = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
          if (exitMethod) {
            exitMethod.call(doc);
          }
        }
      } catch (e) {}
    }
    this._viewSettings = settings;
  }

  get viewSettings() {
    return this._viewSettings;
  }

  @Input()
  set setup(setup: ISetup) {
    if (!setup) {
      return;
    }
    const hasField = {};
    const allFields = [];
    this.updateLocalId(setup);
    this._setup = {
      ...setup,
      labelItems: setup.labelItems.map(item => {
        item.fields.forEach(field => {
          if (!hasField[field.field] && !field.type) {
            hasField[field.field] = true;
            allFields.push(field);
          }
        });
        return { ...item, _id: item._id || LabelMakerComponent.id++ };
      }),
      backSideLabelItems: (setup.backSideLabelItems || []).map(item => {
        item.fields.forEach(field => {
          if (!hasField[field.field] && !field.type) {
            hasField[field.field] = true;
            allFields.push(field);
          }
        });
        return { ...item, _id: item._id || LabelMakerComponent.id++ };
      })
    };
    this.dimensions = this.labelService.countLabelsPerPage(this._setup);
    this.generateFields = allFields;
    if (this._selectedLabelItem) {
      let idx = this._setup.labelItems.findIndex(i => i._id === this._selectedLabelItem._id);
      if (idx !== -1) {
        this._selectedLabelItem = this._setup.labelItems[idx];
      } else {
        idx = this._setup.backSideLabelItems.findIndex(i => i._id === this._selectedLabelItem._id);
        this._selectedLabelItem = this._setup.backSideLabelItems[idx];
      }
    }
    this.setPreviewActive(this.previewActive);
  }

  showSettings(item: ILabelItem) {
    this.setActiveLabelItem(item);
    this._active = 'settings';
    this.cdr.detectChanges();
  }

  setActiveLabelItem(item: ILabelItem) {
    this._selectedLabelItem = item;
    this.cdr.detectChanges();
  }

  setupChanged(setup: ISetup, addToUndo = true) {
    if (addToUndo) {
      this._redo = [];
      this._undo.push(this._setup);
    }
    this._setup = setup;
    this.setupChange.emit(this._setup);
    if (this._undo.length > 20) {
      this._undo.shift();
    }
  }

  addLabelItem(event: IAddLabelEvent) {
    const item = event.item;
    if (!item._id) {
      item._id = LabelMakerComponent.id++;
    }
    this._undo.push(this._setup);
    this._setup = {...this._setup, [event.location]: [...this._setup[event.location], item]};
    this.setupChange.emit(this._setup);
  }

  done() {
    this._selectedLabelItem = undefined;
  }

  undo() {
    if (this.hasUndo()) {
      this._redo.push(this._setup);
      this.setupChanged(this._undo.pop(), false);
    }
  }

  redo() {
    if (this.hasRedo()) {
      this._undo.push(this._setup);
      this.setupChanged(this._redo.pop(), false);
    }
  }

  hasUndo() {
    return this._undo.length > 0;
  }

  hasRedo() {
    return this._redo.length > 0;
  }

  updateGenerate(key: string, value: string, inData = false) {
    if (inData) {
      this.generate = {
        ...this.generate,
        data: {
          ...this.generate.data,
          [key]: value
        }
      };
    } else {
      this.generate = {
        ...this.generate,
        [key]: key === 'uri' ? value : Number(value)
      };
    }
  }

  generateData() {
    this.infoWindowService.close();
    const MAX = 10000;
    const data = [];
    const uri = this.generate.uri + (this.generate.uri.indexOf('%id%') > -1 ? '' : '%id%');
    const start = this.generate.rangeStart < this.generate.rangeEnd ? this.generate.rangeStart : this.generate.rangeEnd;
    const end = this.generate.rangeStart > this.generate.rangeEnd ? this.generate.rangeStart : this.generate.rangeEnd;
    const idFieldsIdx = this.availableFields.findIndex(item => item.type === FieldType.qrCode);
    const idField = idFieldsIdx !== -1 ? this.availableFields[idFieldsIdx].field : 'id';
    let current = 0;
    for (let i = start; i <= end; i++) {
      current++;
      if (current > MAX) {
        break;
      }
      data.push({
        ...this.generate.data,
        [idField]: uri.replace('%id%', '' + i)
      });
    }
    this.data = data;
    this.setPreviewActive(0);
    this.dataChange.emit(this.data);
  }

  openGettingStarted() {
    this.subIntro = this.infoWindowService.open({
      title: this.translateService.get('Getting started'),
      actionTypes: 'ok',
      content: this.gettingStarted
    }).subscribe(() => this.introClosed.emit());
  }

  openIntro() {
    this.subIntro = this.infoWindowService.open({
      title: this.translateService.get('Label Designer'),
      actionTypes: 'ok',
      content: this.intro
    }).subscribe(() => this.introClosed.emit());
  }


  openGenerate() {
    if (!this.generate.uri) {
      this.generate.uri = this.defaultDomain;
    }
    this.infoWindowService.open({
      title: this.translateService.get('Generate label data'),
      content: this.generateTpl,
      actions: this.generateActionsTpl
    });
  }


  importExcel() {
    this.infoWindowService.open({
      title: this.translateService.get('Import from file'),
      content: this.excelTpl,
      actions: this.excelActionsTpl
    });
  }

  setPreviewActive(idx: number) {
    if (this.data && this.data[idx]) {
      this.previewActive = idx;
      this.cdr.detectChanges();
    }
  }

  newFieldDragging(event: boolean, settings: HTMLDivElement) {
    if (event) {
      this.renderer2.setStyle(settings, 'margin-top', '-' + settings.scrollTop + 'px');
      this.renderer2.setStyle(settings, 'padding-bottom', settings.scrollTop + 'px');
      this.renderer2.setStyle(settings, 'height', 'calc(100% + ' + settings.scrollTop + 'px)');
      this.renderer2.setStyle(settings, 'z-index', '-1');
    } else {
      this.renderer2.setStyle(settings, 'margin-top', '0px');
      this.renderer2.removeStyle(settings, 'z-index');
      this.renderer2.removeStyle(settings, 'padding-bottom');
      this.renderer2.setStyle(settings, 'height', '100%');
    }
    this.dragging = event;
  }

  onViewSettingsChange(event: IViewSettings) {
    this.viewSettings = event;
    this.viewSettingsChange.emit(event);
  }

  loadExcelData() {
    const result = this.excelCmp.loadData();
    if (result.availableFields) {
      this.availableFieldsChange.emit(result.availableFields);
    }
    this.data = result.data;
    this.infoWindowService.close();
    this.dataChange.emit(this.data);
  }

  onValueMapChange(map: ILabelValueMap) {
    this.setupChanged({ ...this._setup, valueMap: map }, false);
  }

  private updateLocalId(setup: ISetup) {
    let id = 0;
    ['labelItems', 'backSideLabelItems'].forEach(items => {
      if (setup[items]) {
        setup[items].map(item => {
          if (item._id > id) {
            id = item._id;
          }
        });
      }
    });
    LabelMakerComponent.id = id + 1;
  }

  onPdfLoading(loading: boolean) {
    this.pdfLoading = true;
    this.pdfLoadingChange.emit(loading);
  }
}
