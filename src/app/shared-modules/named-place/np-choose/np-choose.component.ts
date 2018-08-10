import { Inject, PLATFORM_ID } from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import {
  ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { ExtendedNamedPlace } from '../model/extended-named-place';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-np-choose',
  templateUrl: './np-choose.component.html',
  styleUrls: ['./np-choose.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpChooseComponent implements OnInit, OnChanges {
  active = 'list';
  height = '600px';
  mapIsActivated = false;
  _namedPlaces: ExtendedNamedPlace[] = [];

  @Input() formData: any;
  @Input() visible = true;
  @Input() allowCreate = true;
  @Input() userID: string;

  @Output() onActivePlaceChange = new EventEmitter<number>();
  @Output() onCreateButtonClick = new EventEmitter();

  activeNP = -1;

  sent = this.isSent.bind(this);

  private seasonStart;
  private seasonEnd;

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
        this.active = 'map';
        this.mapIsActivated = true;
      } else {
        this.active = 'list';
      }
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
    this.active = newActive;
    if (newActive === 'map') {
      this.mapIsActivated = true;
    }
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    this.onActivePlaceChange.emit(idx);
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
