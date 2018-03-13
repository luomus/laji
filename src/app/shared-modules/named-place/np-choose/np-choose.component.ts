import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { WindowRef } from '../../../shared/windows-ref';
import { ExtendedNamedPlace } from '../model/extended-named-place';

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
  @Input() allowCreate = false;
  @Input() userID: string;

  @Output() onActivePlaceChange = new EventEmitter<number>();
  @Output() onCreateButtonClick = new EventEmitter();

  activeNP = -1;

  sent = this.isSent.bind(this);


  private seasonStart;
  private seasonEnd;

  constructor(
    private window: WindowRef
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
    this.height = Math.min(this.window.nativeWindow.innerHeight - 70, 490) + 'px';
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
      console.log('YEEE');
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
      const now = new Date();
      const delta = now < new Date(this.analyseData(this.formData.options.season.start)) ? -1 : 0;
      this.seasonStart = new Date(this.analyseData(this.formData.options.season.start, delta));
      this.seasonEnd = new Date(this.analyseData(this.formData.options.season.end, delta));
    } else {
      this.seasonStart = undefined;
      this.seasonEnd = undefined;
    }
  }

  private analyseData(date: string, yearDelta = 0): string {
    const now = new Date();
    return date.replace('${year}', '' + (now.getFullYear() + yearDelta))
  }

}
