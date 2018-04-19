import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output,
  ViewChild
} from '@angular/core';
import { Document } from '../../../shared/model/Document';
import * as MapUtil from 'laji-map/lib/utils';
import { LineTransectChartTerms } from './line-transect-chart/line-transect-chart.component';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { Map3Component } from '../../map/map.component';
import { LajiMapOptions } from '../../map/map-options.interface';
import { Units } from '../../../shared/model/Units';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { Observable } from 'rxjs/Observable';
import {ToastsService, UserService} from '../../../shared/service';
import { NamedPlacesService } from '../../named-place/named-places.service';
import { FormPermissionService } from '../../../+haseka/form-permission/form-permission.service';
import * as equals from 'deep-equal';

interface LineTransectCount {
  psCouples: number;
  tsCouples: number;
  onPs: number;
  onPsPros: number;
  routeLength?: number;
  couplesPerKm?: number;
  minPerKm: number;
  species: {id: string, psCouples: number, tsCouples: number, name?: string}[];
}

@Component({
  selector: 'laji-line-transect-stats',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChild(Map3Component)
  lajiMap: Map3Component;

  @Input() document: Document;
  @Input() namedPlace: NamedPlace;

  @Output() onNamedPlaceChange = new EventEmitter();

  counts: LineTransectCount;
  lajiMapOptions: LajiMapOptions;
  perKmTerms: LineTransectChartTerms = {
    upper: {
      slope: -0.1233,
      term: 116.921
    },
    middle: {
      slope: -0.1233,
      term: 104.4
    },
    lower: {
      slope: -0.1233,
      term: 91.84713
    }
  };

  onMainTerms: LineTransectChartTerms = {
    upper: {
      slope: -0.279,
      term: 221.88
    },
    middle: {
      slope: -0.279,
      term: 241.35
    },
    lower: {
      slope: -0.2791,
      term: 260.897
    }
  };
  warnings: {message: string; cnt: number}[] = [];
  stats$: Observable<string>;

  mapZoomInitialized = false;

  placesDiff = false;
  isAdmin = false;
  activeMapLine = 'document';

  ykj10kmN = 0;
  ykj10kmE = 0;

  constructor(
    private lajiApiService: LajiApiService,
    private userSerivce: UserService,
    private namedPlacesService: NamedPlacesService,
    private formPermissionService: FormPermissionService,
    private toastsService: ToastsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges() {
    this.initCounts();
    this.initWarnings();
    this.initMapOptions();
    this.initYkj();
    this.initIsAdmin()
      .subscribe(data => {
        this.isAdmin = this.formPermissionService.isAdmin(data.formPermission, data.user);
        this.initPlacesDiff();
        this.initMapZoom();
        this.cdr.markForCheck();
      });
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.initMapZoom();
  }

  initMapZoom() {
    if (!this.isAdmin || !this.placesDiff || !this.lajiMap.lajiMap || this.mapZoomInitialized) {
      return;
    }

    this.lajiMap.lajiMap.zoomToData({paddingInMeters: 100});
    this.mapZoomInitialized = true;
  }

  private initCounts() {
    const geometries = this.getGeometry();
    const count: LineTransectCount = {
      psCouples: 0,
      tsCouples: 0,
      onPs: 0,
      onPsPros: 0,
      species: [],
      couplesPerKm: 0,
      routeLength: 0,
      minPerKm: 0
    };
    const species = {};
    this.stats$ = this.lajiApiService.get(LajiApi.Endpoints.documentStats,
      {personToken: this.userSerivce.getToken(), namedPlace: this.namedPlace.id})
      .map(stats => this.dateDiffFromDoc(stats.dateMedian))
      .catch(() => Observable.of(''));
    if (this.document.gatherings) {
      this.document.gatherings.map(gathering => {
        if (gathering.units) {
          gathering.units.map(unit => {
            if (unit.identifications && unit.identifications[0]) {
              const taxon = unit.identifications[0].taxonID || unit.identifications[0].taxon || '';
              if (!species[taxon]) {
                species[taxon] = {
                  psCouples: 0,
                  tsCouples: 0,
                  name: unit.identifications[0].taxon || ''
                };
              }
              const cntKey = unit.lineTransectRouteFieldType === Units.LineTransectRouteFieldTypeEnum.LineTransectRouteFieldTypeOuter ?
                'tsCouples' : 'psCouples';
              if (cntKey === 'psCouples') {
                count.onPs++;
              }
              count[cntKey] += unit.pairCount || 0;
              species[taxon][cntKey] += unit.pairCount || 0;
            }
          });
        }
      });
      const dist = MapUtil.getLineTransectStartEndDistancesForIdx({geometry: geometries}, geometries.coordinates.length - 1, 10);
      count.routeLength = dist[1];
      count.couplesPerKm = (count.tsCouples + count.psCouples) / (count.routeLength / 1000);
    }
    Object.keys(species).map(taxon => {
      count.species.push({...species[taxon], id: taxon});
    });
    const total = count.psCouples + count.tsCouples;
    if (total > 0) {
      count.onPsPros = Math.round((count.psCouples / (total)) * 100);
    }
    count.couplesPerKm = (count.tsCouples + count.psCouples) / (count.routeLength / 1000);
    if (this.document.gatheringEvent &&
      this.document.gatheringEvent.dateBegin &&
      this.document.gatheringEvent.timeStart &&
      this.document.gatheringEvent.timeEnd
    ) {
      const diff = +new Date(this.document.gatheringEvent.dateBegin + ' ' + this.document.gatheringEvent.timeEnd) -
        +new Date((this.document.gatheringEvent.dateEnd || this.document.gatheringEvent.dateBegin) + ' ' + this.document.gatheringEvent.timeStart);
      count.minPerKm = Math.round((diff / 1000 / 60) / (count.routeLength / 1000));
    }
    this.counts = count;
  }

  private dateDiffFromDoc(date) {
    if (this.document && this.document.gatheringEvent && this.document.gatheringEvent.dateBegin) {
      const date1 = new Date(this.document.gatheringEvent.dateBegin);
      const date2 = new Date(this.document.gatheringEvent.dateBegin.slice(0, 5) + date);
      const diff = Math.floor(((+date2) - (+date1)) / (1000 * 60 * 60 * 24));
      return diff > 0 ? '+' + diff : '' + diff;
    }
    return '';
  }

  private initWarnings() {
    const warnings: {message: string; cnt: number}[] = [];
    if (this.document.acknowledgedWarnings) {
      const messages = this.getErrors(this.document.acknowledgedWarnings);
      Object.keys(messages).forEach(message => {
        warnings.push({message: message.replace('[warning]', ''), cnt: messages[message]});
      });
    }
    this.warnings = warnings;
  }

  private getErrors(warnings: {location: string, messages: string[]}[], messages = {}) {
    warnings.forEach(error => {
      error.messages.forEach(msg => {
        messages[msg] = messages[msg] ? messages[msg] + 1 : 1;
      });
    });
    return messages;
  }

  private initMapOptions() {
    this.lajiMapOptions = {
      tileLayerName: 'maastokartta',
      lineTransect: {
        feature: {geometry: this.getGeometry(this.activeMapLine)},
        editable: false
      },
      tileLayerOpacity: 0.5
    };
  }

  private initYkj() {
    if (this.namedPlace && this.namedPlace.name) {
      const match = this.namedPlace.name.match(/([0-9]{3}):([0-9]{3})/);
      if (match) {
        this.ykj10kmN = +match[1];
        this.ykj10kmE = +match[2];
      }
    }
  }

  private initPlacesDiff() {
    const diff = !equals(this.getGeometry('document'), this.getGeometry(('acceptedDocument')));
    this.placesDiff = diff;
  }

  private getGeometry(documentName = 'document') {
    const document = documentName === 'document'
        ? this.document
        : this.namedPlace.acceptedDocument;

    if (document.gatherings) {
      return {type: 'MultiLineString', coordinates: document.gatherings.map(item => item.geometry.coordinates)};
    }
    return {coordinates: []};
  }

  initIsAdmin() {
    return this.formPermissionService.getFormPermission(this.namedPlace.collectionID, this.userSerivce.getToken())
      .combineLatest(
        this.userSerivce.getUser(),
        (formPermission, user) => ({formPermission, user})
      );
  }

  setActiveMapLine(activeMapLine) {
    this.activeMapLine = activeMapLine;
    this.lajiMap.lajiMap.setLineTransect({...this.lajiMapOptions.lineTransect, feature: {geometry: this.getGeometry(this.activeMapLine)}})
  }

  acceptNamedPlaceChanges() {
    this.namedPlacesService.updateNamedPlace(
      this.namedPlace.id,
      {...this.namedPlace, acceptedDocument: this.document},
      this.userSerivce.getToken()
    ).subscribe((np: NamedPlace) => {
      this.onNamedPlaceChange.emit(np);
      this.toastsService.showSuccess('Linjan päivitys onnistui. Tämän laskennan karttaa käytetään pohjana tämän linjan laskennoille jatkossa');
    });
  }
}
