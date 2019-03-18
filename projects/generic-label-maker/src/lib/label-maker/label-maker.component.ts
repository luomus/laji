import {
  ChangeDetectionStrategy,
  Component, ElementRef,
  EventEmitter, Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2,
  ViewChild
} from '@angular/core';
import { IAddLabelEvent, ILabelField, ILabelItem, ISetup, IViewSettings } from '../generic-label-maker.interface';
import { IPageLayout, LabelService } from '../label.service';
import { InfoWindowService } from '../info-window/info-window.service';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'll-label-maker',
  templateUrl: './label-maker.component.html',
  styleUrls: ['./label-maker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelMakerComponent implements OnInit, OnDestroy {

  static id = 0;

  @ViewChild('intro') intro;

  _active: 'file'|'edit'|'view'|'settings'|'fields'|'help' = 'file';
  _setup: ISetup;
  _selectedLabelItem: ILabelItem | undefined;
  fields: ILabelField[];
  dragging = false;
  version = '0.0.8';
  @Input() availableFields: ILabelField[];
  @Input() data: object[];
  @Input() showIntro = true;
  _viewSettings: IViewSettings = {magnification: 2};

  @Output() html = new EventEmitter<string>();
  @Output() viewSettingsChange = new EventEmitter<IViewSettings>();
  @Output() setupChange = new EventEmitter<ISetup>();
  @Output() introClosed = new EventEmitter();
  @ViewChild('editor') editor: ElementRef<HTMLDivElement>;
  subIntro: Subscription;

  generate: {
    uri: string;
    rangeStart: number;
    rangeEnd: number;
    data: {[key: string]: string}
  } = {
    uri: '',
    rangeStart: 1,
    rangeEnd: 10,
    data: {}
  };

  dimensions: IPageLayout;

  private _undo: ISetup[] = [];
  private _redo: ISetup[] = [];

  constructor(
    private labelService: LabelService,
    private renderer2: Renderer2,
    private infoWindowService: InfoWindowService,
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
  set viewSettings(settings: IViewSettings) {
    if (isPlatformBrowser(this.platformId) && settings.fullscreen !== this._viewSettings.fullscreen) {
      try {
        if (settings.fullscreen) {
          const elem: any = this.editor.nativeElement;
          const enterMethod = elem.requestFullScreen || elem.webkitRequestFullScreen ||
            elem.mozRequestFullScreen || elem.msRequestFullScreen;
          if (enterMethod) {
            enterMethod.call(elem);
          }
        } else {
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
    const hasField = {};
    const allFields = [];
    this._setup = {
      ...setup,
      labelItems: setup.labelItems.map(item => {
        item.fields.forEach(field => {
          if (!hasField[field.field] && !field.type && field.field !== 'id') {
            hasField[field.field] = true;
            allFields.push(field);
          }
        });
        return {
        ...item,
          _id: item._id || LabelMakerComponent.id++
        };
      }),
      backSideLabelItems: (setup.backSideLabelItems || []).map(item => {
        item.fields.forEach(field => {
          if (!hasField[field.field] && !field.type && field.field !== 'id') {
            hasField[field.field] = true;
            allFields.push(field);
          }
        });
        return {
          ...item,
          _id: item._id || LabelMakerComponent.id++
        };
      })
    };
    this.dimensions = this.labelService.countLabelsPerPage(this._setup);
    this.fields = allFields;
    if (this._selectedLabelItem) {
      let idx = this._setup.labelItems.findIndex(i => i._id === this._selectedLabelItem._id);
      if (idx !== -1) {
        this._selectedLabelItem = this._setup.labelItems[idx];
      } else {
        idx = this._setup.backSideLabelItems.findIndex(i => i._id === this._selectedLabelItem._id);
        this._selectedLabelItem = this._setup.backSideLabelItems[idx];
      }
    }
  }

  showSettings(item: ILabelItem) {
    this.setActiveLabelItem(item);
    this._active = 'settings';
  }

  setActiveLabelItem(item: ILabelItem) {
    this._selectedLabelItem = item;
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
    const uri = this.generate.uri + (this.generate.uri.indexOf('%id%') > -1 ? '' : '%id%');
    const data = [];
    const start = this.generate.rangeStart < this.generate.rangeEnd ? this.generate.rangeStart : this.generate.rangeEnd;
    const end = this.generate.rangeStart > this.generate.rangeEnd ? this.generate.rangeStart : this.generate.rangeEnd;
    const MAX = 100000;
    let current = 0;
    for (let i = start; i <= end; i++) {
      current++;
      if (current > MAX) {
        break;
      }
      data.push({
        ...this.generate.data,
        id: uri.replace('%id%', '' + i)
      });
    }
    this.data = data;
    if  (this.data[0]) {
      this.setAsExample(this.data[0]);
    }
  }

  openIntro() {
    this.subIntro = this.infoWindowService.open({
      title: 'Generic label editor',
      actionTypes: 'ok',
      content: this.intro
    }).subscribe(() => this.introClosed.emit());
  }

  private setAsExample(doc: any) {
    this._setup = {
      ...this._setup,
      labelItems: this.setExampleInLabelItems(doc, this._setup.labelItems),
      backSideLabelItems: this.setExampleInLabelItems(doc, this._setup.backSideLabelItems)
    };
  }

  private setExampleInLabelItems(doc: any, items: ILabelItem[]): ILabelItem[] {
    return items.map(item => ({
      ...item,
      fields: item.fields.map(field => ({...field, content: doc[field.field]}))
    }));
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
}
