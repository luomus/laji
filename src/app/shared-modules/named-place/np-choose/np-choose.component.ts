import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { ExtendedNamedPlace } from '../model/extended-named-place';
import { isPlatformBrowser } from '@angular/common';
import { NpMapComponent } from './np-map/np-map.component';

@Component({
  selector: 'laji-np-choose',
  templateUrl: './np-choose.component.html',
  styleUrls: ['./np-choose.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpChooseComponent implements OnInit, OnChanges, AfterViewChecked {
  @ViewChild(NpMapComponent) lajiMap: NpMapComponent;
  active = 'list';
  height = '600px';
  mapIsActivated = false;
  _namedPlaces: ExtendedNamedPlace[] = [];
  _prevNamedPlacesMapRendered: ExtendedNamedPlace[] = [];
  _prevActive: string;

  @Input() formData: any;
  @Input() visible = true;
  @Input() allowCreate = true;
  @Input() userID: string;
  @Input() zoomToData: boolean;

  @Output() onActivePlaceChange = new EventEmitter<number>();
  @Output() onCreateButtonClick = new EventEmitter();

  sent = this.isSent.bind(this);

  private seasonStart;
  private seasonEnd;

  _activeNP = -1;

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object
  ) {}

  ngOnInit() {
    this.updateHeight();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData']) {
      if (this.formData && this.formData.namedPlaceOptions && this.formData.namedPlaceOptions.startWithMap) {
        this.setActive('map');
      } else {
        this.active = 'list';
      }
    }
  }

  ngAfterViewChecked() {
    if (!this.zoomToData) {
      return;
    }
    const activeChanged = this._prevActive !== this.active;
    const namedPlacesChanged = this._prevNamedPlacesMapRendered !== this._namedPlaces;
    const map = this.lajiMap && this.lajiMap.lajiMap.map;
    if (map && this.active === 'map' && activeChanged && namedPlacesChanged) {
      if (!(this._namedPlaces || []).length) {
        map._initializeView();
      } else {
        map.zoomToData();
      }
      this._prevNamedPlacesMapRendered = this._namedPlaces;
    }
  }

  @Input() set namedPlaces(namedPlaces: NamedPlace[]) {
    if (!this.seasonStart) {
      this.initEarliestAndLatest();
    }
    const extendedNamedPlaces: ExtendedNamedPlace[] = [];
    for (const namedPlace of namedPlaces) {
      extendedNamedPlaces.push({...namedPlace, _status: this.getNamedPlaceStatus(namedPlace)})
    }
    this._namedPlaces = extendedNamedPlaces;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateHeight();
  }

  updateHeight() {
    if (isPlatformBrowser(this.platformID)) {
      this.height = Math.min(this.window.innerHeight - 70, 490) + 'px';
    }
  }

  setActive(newActive: string) {
    this._prevActive = this.active;
    this.active = newActive;
    if (newActive === 'map') {
      this.mapIsActivated = true;
    }
  }

  @Input() set activeNP(idx: number) {
    this._activeNP = idx;
    this.onActivePlaceChange.emit(idx);
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
  }

  createButtonClick() {
    this.onCreateButtonClick.emit();
  }

  showMap() {
    return !(
      this.formData &&
      this.formData.namedPlaceOptions &&
      this.formData.namedPlaceOptions.hideMapTab &&
      this.formData.namedPlaceOptions.hideMapTab === true
    );
  }

  isSent(np: NamedPlace) {
    if (this.seasonStart && this.seasonEnd) {
      if (np && np.prepopulatedDocument && np.prepopulatedDocument.gatheringEvent && np.prepopulatedDocument.gatheringEvent.dateBegin) {
        const dateBegin = new Date(np.prepopulatedDocument.gatheringEvent.dateBegin);
        return this.seasonStart <= dateBegin && dateBegin <= this.seasonEnd;
      }
    }
    return false;
  }

  private getNamedPlaceStatus(np: NamedPlace): 'free'|'mine'|'reserved'|'sent' {
    if (this.isSent(np)) {
      return 'sent';
    }
    if (!np.reserve) {
      return 'free'
    }
    const now = new Date();
    const until = new Date(np.reserve.until);
    if (now > until) {
      return 'free';
    } else if (np.reserve.reserver === this.userID) {
      return 'mine'
    }
    return 'reserved';
  }

  private initEarliestAndLatest() {
    if (this.formData.options && this.formData.options.season && this.formData.options.season.start && this.formData.options.season.end) {
      this.seasonStart = new Date(this.analyseData(this.formData.options.season.start));
      this.seasonEnd = new Date(this.analyseData(this.formData.options.season.end));
    } else {
      this.seasonStart = undefined;
      this.seasonEnd = undefined;
    }
  }

  private analyseData(date: string): string {
    const now = new Date();
    return date.replace('${year}', '' + now.getFullYear())
  }

}
