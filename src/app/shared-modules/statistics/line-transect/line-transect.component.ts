import {
  ChangeDetectionStrategy, Component, Input, OnChanges, OnInit,
  ViewChild
} from '@angular/core';
import { Document } from '../../../shared/model/Document';
import * as MapUtil from 'laji-map/lib/utils';
import { LineTransectChartTerms } from './line-transect-chart/line-transect-chart.component';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { Map3Component } from '../../map/map.component';
import { LajiMapOptions } from '../../map/map-options.interface';
import { Units } from '../../../shared/model/Units';

interface LineTransectCount {
  psCouples: number;
  tsCouples: number;
  onPs: number;
  onPsPros: number;
  routeLength?: number;
  ykj10kmN?: number;
  ykj10kmE?: number;
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
export class LineTransectComponent implements OnChanges, OnInit {
  @ViewChild(Map3Component)
  public lajiMap: Map3Component;

  @Input() document: Document;
  @Input() namedPlace: NamedPlace;

  public counts: LineTransectCount;
  public lajiMapOptions: LajiMapOptions;
  public perKmTerms: LineTransectChartTerms = {
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

  public onMainTerms: LineTransectChartTerms = {
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
  private ykj10kmN = 0;
  private ykj10kmE = 0;

  constructor() {}

  ngOnChanges() {
    this.initCounts();
    this.initWarnings();
    this.initMapOptions();
  }

  ngOnInit() {
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
      ykj10kmN: this.ykj10kmN,
      ykj10kmE: this.ykj10kmE,
      minPerKm: 0
    };
    const species = {};
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

  private initWarnings() {
    const warnings: {message: string; cnt: number}[] = [];
    if (this.document.acknowledgedWarnings) {
      const messages = this.getErrors(this.document.acknowledgedWarnings);
      Object.keys(messages).forEach(message => {
        warnings.push({message: message.replace('[warning]', ''), cnt: messages[message]});
      })
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
        feature: {geometry: this.getGeometry()}
      }
    };
  }

  private getGeometry() {
    if (this.namedPlace.alternativeIDs) {
      for (const altId of this.namedPlace.alternativeIDs) {
        if (altId.match(/[0-9]{3}:[0-9]{3}/)) {
          const parts = altId.split(':');
          this.ykj10kmN = +parts[0];
          this.ykj10kmE = +parts[1];
          break;
        }
      }
    }
    if (this.document.gatherings) {
      return {type: 'MultiLineString', coordinates: this.document.gatherings.map(item => item.geometry.coordinates)};
    }
    return {coordinates: []};
  }

}
