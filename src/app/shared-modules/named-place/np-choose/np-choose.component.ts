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

  @Input() documentForm: any;
  @Input() placeForm: any;
  @Input() visible = true;
  @Input() allowCreate = true;
  @Input() userID: string;
  @Input() zoomToData: boolean;

  @Output() activePlaceChange = new EventEmitter<number>();
  @Output() createButtonClick = new EventEmitter();
  @Output() tabChange = new EventEmitter();

  sent = this.isSent.bind(this);

  private seasonStart;
  private seasonEnd;

  _activeNP = -1;

  private FEATURE_RESERVE = 'MHL.featureReserve';

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object
  ) {}

  ngOnInit() {
    this.updateHeight();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentForm']) {
      if (this.documentForm && this.documentForm.namedPlaceOptions && this.documentForm.namedPlaceOptions.startWithMap) {
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
      extendedNamedPlaces.push({...namedPlace, _status: this.getNamedPlaceStatus(namedPlace)});
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
    this.tabChange.emit(newActive);
  }

  @Input() set activeNP(idx: number) {
    this._activeNP = idx;
  }

  onActivePlaceChange(idx: number) {
    this.activeNP = idx;
    this.activePlaceChange.emit(this._activeNP);
  }

  showMap() {
    return !(
      this.documentForm &&
      this.documentForm.namedPlaceOptions &&
      this.documentForm.namedPlaceOptions.hideMapTab &&
      this.documentForm.namedPlaceOptions.hideMapTab === true
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
      return 'free';
    }
    const now = new Date();
    const until = new Date(np.reserve.until);
    if (now > until) {
      return 'free';
    } else if (np.reserve.reserver === this.userID) {
      return 'mine';
    }
    return 'reserved';
  }

  private initEarliestAndLatest() {
    const {options: {season = {}} = {}} = this.documentForm;
    if (season.start && season.end) {
      this.seasonStart = new Date(this.analyseData(this.documentForm.options.season.start));
      this.seasonEnd = new Date(this.analyseData(this.documentForm.options.season.end));
    } else {
      this.seasonStart = undefined;
      this.seasonEnd = undefined;
    }
  }

  private analyseData(date: string): string {
    const now = new Date();
    return date.replace('${year}', '' + now.getFullYear());
  }
}
