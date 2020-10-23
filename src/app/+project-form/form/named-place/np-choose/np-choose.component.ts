import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { ExtendedNamedPlace } from '../model/extended-named-place';
import { LoadedElementsStore } from '../../../../../../projects/laji-ui/src/lib/tabs/tab-utils';
import { Rights } from '../../../../shared/service/form-permission.service';
import { PlatformService } from '../../../../shared/service/platform.service';
import { Form } from '../../../../shared/model/Form';

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
  _documentForm: Form.SchemaForm;
  _userID: string;

  @Input() placeForm: Form.SchemaForm;
  @Input() visible = true;
  @Input() allowCreate = true;
  @Input() showMap = true;
  @Input() formRights: Rights;

  @Output() activePlaceChange = new EventEmitter<string>();
  @Output() createButtonClick = new EventEmitter();
  @Output() tabChange = new EventEmitter();

  sent = this.isSent.bind(this);

  private seasonStart;
  private seasonEnd;

  _activeNP;

  constructor(
    private platformService: PlatformService
  ) {}

  ngOnInit() {
    this.loadedTabs.load(this.activeIndex);
    this.updateHeight();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['documentForm']) {
      if (this._documentForm?.options?.namedPlaceOptions?.startWithMap) {
        this.activeIndex = this.loadedTabs.getIdxFromName('map');
        this.loadedTabs.load(this.activeIndex);
      } else {
        this.activeIndex = this.loadedTabs.getIdxFromName('list');
        this.loadedTabs.load(this.activeIndex);
      }
    }
  }

  @Input() set userID(userID: string) {
    this._userID = userID;
    // Reset so uses user id correctly.
    this.namedPlaces = [...this._namedPlaces];
  }

  @Input() set namedPlaces(namedPlaces: NamedPlace[]) {
    const extendedNamedPlaces: ExtendedNamedPlace[] = [];
    for (const namedPlace of namedPlaces) {
      extendedNamedPlaces.push({...namedPlace, _status: this.getNamedPlaceStatus(namedPlace)});
    }
    this._namedPlaces = extendedNamedPlaces;
  }

  @Input() set documentForm(documentForm: any) {
    this._documentForm = documentForm;
    if (!this.seasonStart) {
      this.initEarliestAndLatest();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateHeight();
  }

  updateHeight() {
    if (this.platformService.isBrowser) {
      this.height = Math.min(window.innerHeight - 70, 490) + 'px';
    }
  }

  setActive(newActive: number) {
    this.activeIndex = newActive;
    this.loadedTabs.load(newActive);
    this.tabChange.emit(this.loadedTabs.getNameFromIdx(newActive));
  }

  @Input() set activeNP(id: string) {
    this._activeNP = id;
  }

  private findNPIdByIndex(idx: number) {
    return this._namedPlaces[idx].id;
  }

  findNPIndexById(id: string) {
    if (!this._namedPlaces) {
      return null;
    }
    return this._namedPlaces.findIndex((np) => {
      return np.id === id;
    });
  }

  onActivePlaceChange(idx: number) {
    this.activeNP = this.findNPIdByIndex(idx);
    this.activePlaceChange.emit(this._activeNP);
  }

  isSent(np: NamedPlace) {
    if (this.seasonStart && this.seasonEnd && np?.prepopulatedDocument?.gatheringEvent?.dateBegin) {
      const dateBegin = new Date(np.prepopulatedDocument.gatheringEvent.dateBegin);
      return this.seasonStart <= dateBegin && dateBegin <= this.seasonEnd;
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
    } else if (np.reserve.reserver === this._userID) {
      return 'mine';
    }
    return 'reserved';
  }

  private initEarliestAndLatest() {
    const season = this._documentForm.options?.season || {} as Form.SchemaForm['options']['season'];
    if (season.start && season.end) {
      this.seasonStart = new Date(this.analyseData(season.start));
      this.seasonEnd = new Date(this.analyseData(season.end));
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
