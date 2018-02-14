import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges,
  ViewChild
} from '@angular/core';
import { Document } from '../../../shared/model/Document';
import * as MapUtil from 'laji-map/lib/utils';
import { CoordinateService } from '../../../shared/service/coordinate.service';
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
  species: {id: string, psCouples: number, tsCouples: number, name?: string}[];
}

@Component({
  selector: 'laji-line-transect-stats',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectComponent implements OnChanges, AfterViewInit {
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

  constructor(
    private coordinateService: CoordinateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges() {
    this.initCounts();
    this.initMapOptions();
  }

  ngAfterViewInit() {
    if (this.lajiMap && this.lajiMap.lajiMap.pointIdxsToDistances) {
      const keys = Object.keys(this.lajiMap.lajiMap.pointIdxsToDistances);
      const lastKey = keys.pop();
      setTimeout(() => {
        this.counts.routeLength = parseInt(this.lajiMap.lajiMap.pointIdxsToDistances[lastKey], 10);
        this.counts.couplesPerKm = (this.counts.tsCouples + this.counts.psCouples) /
          (this.counts.routeLength / 1000);
        this.cd.markForCheck();
      }, 100);

    }
  }

  private initCounts() {
    const count = {
      psCouples: 0,
      tsCouples: 0,
      onPs: 0,
      onPsPros: 0,
      species: []
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
    }
    Object.keys(species).map(taxon => {
      count.species.push({...species[taxon], id: taxon});
    });
    const total = count.psCouples + count.tsCouples;
    if (total > 0) {
      count.onPsPros = Math.round((count.psCouples / (total)) * 100);
    }
    this.counts = count;
  }

  private initMapOptions() {
    this.lajiMapOptions = {
      tileLayerName: 'maastokartta',
      lineTransect: {
        feature: {geometry: this.getGeometry()},
        printMode: true
      }
    };
  }

  private getGeometry() {
    if (this.namedPlace.alternativeIDs) {
      for (const altId of this.namedPlace.alternativeIDs) {
        if (altId.match(/[0-9]{3}:[0-9]{3}/)) {
          const parts = altId.split(':');
          this.counts.ykj10kmN = +parts[0];
          this.counts.ykj10kmE = +parts[1];
          break;
        }
      }
    }
    if (this.document.gatherings) {
      return MapUtil.latLngSegmentsToGeoJSONGeometry(
        this.document.gatherings
          .map(gathering => {
            if (gathering.geometry && gathering.geometry.coordinates) {
              return gathering.geometry.coordinates;
            }
            return [0, 0];
          })
      );
    }
    return {};
  }

}
