import { catchError, map } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { Document } from '../../../../shared/model/Document';
import * as MapUtil from '@luomus/laji-map/lib/utils';
import { LineTransectChartTerms } from './line-transect-chart/line-transect-chart.component';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { Units } from '../../../../shared/model/Units';
import { LajiApi, LajiApiService } from '../../../../shared/service/laji-api.service';
import { Observable, of as ObservableOf } from 'rxjs';
import { UserService } from '../../../../shared/service/user.service';
import { FormService } from '../../../../shared/service/form.service';
import { LineTransectGeometry } from '@luomus/laji-map/lib/defs';

interface LineTransectCount {
  psCouples: number;
  tsCouples: number;
  onPsPros: number;
  routeLength?: number;
  couplesPerKm?: number;
  minPerKm: number;
  species: {id: string; psCouples: number; tsCouples: number; name?: string}[];
}

@Component({
  selector: 'laji-line-transect-stats',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectComponent implements OnChanges {
  @Input() document!: Document;
  @Input() namedPlace!: NamedPlace;

  @Output() namedPlaceChange = new EventEmitter();

  counts!: LineTransectCount;
  perKmTerms: LineTransectChartTerms = {
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

  onMainTerms: LineTransectChartTerms = {
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
  warnings: {message: string; cnt: number}[] = [];
  stats$!: Observable<string>;

  ykj10kmN = 0;
  ykj10kmE = 0;
  missingNS = false;
  path = '';

  constructor(
    private lajiApiService: LajiApiService,
    private userSerivce: UserService,
    private formService: FormService,
  ) {}

  ngOnChanges() {
    this.initCounts();
    this.initWarnings();
    this.initYkj();
    this.initEditLink();

    this.missingNS = !this.namedPlace || !this.namedPlace.collectionID;
  }

  private initEditLink() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.path = this.formService.getEditUrlPath(this.document.formID, this.document.id!);
  }

  private initCounts() {
    const geometries = this.getGeometry();
    const count: LineTransectCount = {
      psCouples: 0,
      tsCouples: 0,
      onPsPros: 0,
      species: [],
      couplesPerKm: 0,
      routeLength: 0,
      minPerKm: 0
    };
    const species: any = {};
    this.stats$ = this.lajiApiService.getList(LajiApi.Endpoints.documentStats,
      {personToken: this.userSerivce.getToken(), namedPlace: this.namedPlace.id}).pipe(
      map(stats => this.dateDiffFromDoc(stats.dateMedian))).pipe(
      catchError(() => ObservableOf('')));
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
              const cntKey =
                unit.unitFact &&
                unit.unitFact.lineTransectRouteFieldType === Units.LineTransectRouteFieldTypeEnum.LineTransectRouteFieldTypeOuter ?
                  'tsCouples' : 'psCouples';
              count[cntKey] += unit.pairCount || 0;
              species[taxon][cntKey] += unit.pairCount || 0;
            }
          });
        }
      });
      const dist = MapUtil.getLineTransectStartEndDistancesForIdx({geometry: geometries} as any, geometries.coordinates.length - 1, 10);
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    count.couplesPerKm = (count.tsCouples + count.psCouples) / (count.routeLength! / 1000);
    if (this.document.gatheringEvent &&
      this.document.gatheringEvent.dateBegin &&
      this.document.gatheringEvent.timeStart &&
      this.document.gatheringEvent.timeEnd
    ) {
      const diff = +new Date(this.document.gatheringEvent.dateBegin + ' ' + this.document.gatheringEvent.timeEnd) -
        +new Date(
          (this.document.gatheringEvent.dateEnd || this.document.gatheringEvent.dateBegin) + ' ' + this.document.gatheringEvent.timeStart
        );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      count.minPerKm = Math.round((diff / 1000 / 60) / (count.routeLength! / 1000));
    }
    this.counts = count;
  }

  private dateDiffFromDoc(date: any) {
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

  private getErrors(warnings: {location: string; messages: string[]}[], messages: any = {}) {
    warnings.forEach(error => {
      error.messages.forEach(msg => {
        messages[msg] = messages[msg] ? messages[msg] + 1 : 1;
      });
    });
    return messages;
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

  private getGeometry(documentName = 'document'): LineTransectGeometry {
    const document = documentName === 'document'
        ? this.document
        : this.namedPlace.acceptedDocument;

   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
   if (document!.gatherings) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return {type: 'MultiLineString', coordinates: document!.gatherings.map(item => item!.geometry!.coordinates)};
    }
    return {type: 'MultiLineString', coordinates: []};
  }
}
