import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, ViewChild} from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import * as MapUtil from 'laji-map/lib/utils';
import { Person } from '../../../../shared/model/Person';
import { LajiMapOptions } from '../../../../shared-modules/map/map-options.interface';
import { Map3Component } from '../../../../shared-modules/map/map.component';

@Component({
  selector: 'laji-line-transect',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectComponent implements OnChanges, AfterViewInit {

  @ViewChild(Map3Component)
  public lajiMap: Map3Component;
  @Input()
  public namedPlace: NamedPlace;
  @Input()
  public person: Person;

  public lajiMapOptions: LajiMapOptions;
  public biotopes: {[distRow: number]: string[]};
  public pages: number[][] = [];
  public total: number;
  public routeLength: number;
  public neDistance: any = 0;
  public ykjGrid: string;
  public info: {key: string, data: string}[];
  public formSplit = 50;

  private pageSize = 10;

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

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
    if (!Array.isArray(geometries.coordinates)) {
      return;
    }
    const biotopes: {[distRow: number]: string[]} = {};
    const pages: number[][] = [];
    let total = 0;
    let currentPage = 0;
    let current = 0;
    geometries.coordinates.forEach((coord, idx) => {
      const dist = MapUtil.getLineTransectStartEndDistancesForIdx({geometry: geometries}, idx, 10);
      const biotopeSlot = current === dist[0] ? current : current - this.formSplit;
      if (!biotopes[biotopeSlot]) {
        biotopes[biotopeSlot] = [];
      }
      biotopes[biotopeSlot].unshift(current !== dist[0] ? 'Biotooppi ' + idx + ' (' + dist[0] + 'm.)' : 'Biotooppi ' + idx);
      total = dist[1];
      while (current < total) {
        if (!pages[currentPage]) {
          pages[currentPage] = [];
        } else if (pages[currentPage].length >= this.pageSize) {
          currentPage++;
          pages[currentPage] = [];
        }
        current += this.formSplit;
        pages[currentPage].unshift(current);
      }
    });
    if (pages[currentPage]) {
      if (pages[currentPage][0] > total) {
        pages[currentPage][0] = total;
      }
    }
    this.biotopes = biotopes;
    this.lajiMap.lajiMap.zoomToData({paddingInMeters: 200});
    this.lajiMap.lajiMap.map.dragging.disable();
    this.lajiMap.lajiMap.map.touchZoom.disable();
    this.lajiMap.lajiMap.map.doubleClickZoom.disable();
    this.lajiMap.lajiMap.map.scrollWheelZoom.disable();
    this.lajiMap.lajiMap.map.boxZoom.disable();
    this.lajiMap.lajiMap.map.keyboard.disable();
    if (this.lajiMap.lajiMap.map.tap) {
      this.lajiMap.lajiMap.map.tap.disable();
    }
    setTimeout(() => {
      this.pages = pages;
      this.total = pages.length;
      this.routeLength = total;
      this.cdr.markForCheck();
    });
  }

  private initMapOptions() {
    this.lajiMapOptions = {
      tileLayerName: 'maastokartta',
      tileLayerOpacity: 0.5,
      lineTransect: {
        printMode: true,
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
