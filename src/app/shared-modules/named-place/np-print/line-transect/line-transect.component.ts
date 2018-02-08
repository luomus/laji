import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import * as MapUtil from 'laji-map/lib/utils';
import { Person } from '../../../../shared/model/Person';
import { LajiMapOptions } from '../../../../shared-modules/map/map-options.interface';
import { Map3Component } from '../../../../shared-modules/map/map.component';

@Component({
  selector: 'laji-line-transect',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.scss']
})
export class LineTransectComponent implements OnChanges, AfterViewInit {

  @ViewChild(Map3Component)
  public lajiMap: Map3Component;
  @Input()
  public namedPlace: NamedPlace;
  @Input()
  public person: Person;

  public lajiMapOptions: LajiMapOptions;
  public pagedDistance: number[][] = [];
  public total: number;
  public routeLength: number;
  public neDistance: any = 0;
  public ykjGrid: string;
  public info: {key: string, data: string}[];

  private pageSize = 10;

  constructor() { }

  ngOnChanges() {
    if (
      this.namedPlace.prepopulatedDocument &&
      this.namedPlace.prepopulatedDocument.gatheringEvent &&
      this.namedPlace.prepopulatedDocument.gatheringEvent.startDistanceFromNECorner
    ) {
      this.neDistance = this.namedPlace.prepopulatedDocument.gatheringEvent.startDistanceFromNECorner;
    }
    if (this.namedPlace.alternativeIDs) {
      this.namedPlace.alternativeIDs.map(id => {
        if (id.match(/[0-9]{3}:[0-9]{3}/)) {
          this.ykjGrid = id;
        }
      });
    }
    if (this.namedPlace.notes) {
      const info = [];
      const parts = this.namedPlace.notes.split('\n');
      if (parts.length < 2 && this.namedPlace.notes) {
        info.push({key: 'Kuvaus', data: this.namedPlace.notes});
      } else {
        let data = '';
        let dataValue;
        parts.map(value => {
          if (value.indexOf(':') === value.length - 1) {
            if (dataValue) {
              dataValue.data = data;
              info.push(dataValue);
            }
            data = '';
            dataValue = {key: value};
          } else {
            data += value + '\n';
          }
        });
      }
      this.info = info;
    }
    this.initMapOptions();
  }

  ngAfterViewInit() {
    const geometries = this.getGeometry();
    if (!geometries.coordinates) {
      return;
    }
    let last;
    geometries.coordinates.forEach((coord, idx) => {
      const page = Math.floor((+idx) / this.pageSize);
      if (!this.pagedDistance[page]) {
        this.pagedDistance[page] = [];
      }
      const dist = MapUtil.getLineTransectStartEndDistancesForIdx({geometry: geometries}, idx, 10);
      if (last && last[0] === dist[0]) {
        return;
      }
      last = dist;
      this.pagedDistance[page].push(last[0]);
    });
    if (last) {
      const lastPage = Math.floor(geometries.coordinates.length / this.pageSize);
      if (!this.pagedDistance[lastPage]) {
        this.pagedDistance[lastPage] = [];
      }
      this.pagedDistance[lastPage].push(last[1]);
    }
    this.lajiMap.lajiMap.zoomToData();
    setTimeout(() => {
      const pages = this.pagedDistance.length;
      this.total = pages + 1;
      this.routeLength = this.pagedDistance[pages - 1][this.pagedDistance[pages - 1].length - 1];
    });
  }

  private initMapOptions() {
    this.lajiMapOptions = {
      tileLayerName: 'maastokartta',
      lineTransect: {
        feature: {geometry: this.getGeometry()}
      }
    };
  }

  private getGeometry(): any {
    if (this.namedPlace.prepopulatedDocument && this.namedPlace.prepopulatedDocument.gatherings) {
      return {type: 'MultiLineString', coordinates: this.namedPlace.prepopulatedDocument.gatherings.map(item => item.geometry.coordinates)};
    }
    return {};
  }

}
