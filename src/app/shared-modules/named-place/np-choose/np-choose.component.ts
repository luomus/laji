import {
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
  SimpleChanges
} from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { ExtendedNamedPlace } from '../model/extended-named-place';
import { isPlatformBrowser } from '@angular/common';
import { LoadedElementsStore } from '../../../../../projects/laji-ui/src/lib/tabs/tab-utils';

@Component({
  selector: 'laji-np-choose',
  templateUrl: './np-choose.component.html',
  styleUrls: ['./np-choose.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpChooseComponent implements OnInit, OnChanges {
  activeIndex = 0;
  loadedTabs = new LoadedElementsStore(['list', 'map']);

  height = '600px';
  _namedPlaces: ExtendedNamedPlace[] = [];

  @Input() documentForm: any;
  @Input() placeForm: any;
  @Input() visible = true;
  @Input() allowCreate = true;
  @Input() userID: string;

  @Output() activePlaceChange = new EventEmitter<number>();
  @Output() createButtonClick = new EventEmitter();
  @Output() tabChange = new EventEmitter();

  sent = this.isSent.bind(this);

  private seasonStart;
  private seasonEnd;

  _activeNP = -1;

  FEATURE_RESERVE = 'MHL.featureReserve';

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object
  ) {}

  ngOnInit() {
    this.loadedTabs.load(this.activeIndex);
    this.updateHeight();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentForm']) {
      if (this.documentForm && this.documentForm.namedPlaceOptions && this.documentForm.namedPlaceOptions.startWithMap) {
        this.activeIndex = this.loadedTabs.getIdxFromName('map');
        this.loadedTabs.load(this.activeIndex);
      } else {
        this.activeIndex = this.loadedTabs.getIdxFromName('list');
        this.loadedTabs.load(this.activeIndex);
      }
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

  @HostListener('window:resize')
  onResize() {
    this.updateHeight();
  }

  updateHeight() {
    if (isPlatformBrowser(this.platformID)) {
      this.height = Math.min(this.window.innerHeight - 70, 490) + 'px';
    }
  }

  setActive(newActive: number) {
    this.activeIndex = newActive;
    this.loadedTabs.load(newActive);
    this.tabChange.emit(this.loadedTabs.getNameFromIdx(newActive));
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
