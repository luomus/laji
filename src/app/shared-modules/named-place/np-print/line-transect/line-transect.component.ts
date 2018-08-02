import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, ViewChild} from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import * as MapUtil from 'laji-map/lib/utils';
import { Person } from '../../../../shared/model/Person';
import { LajiMap } from '../../../laji-map/laji-map.interface';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { CoordinateService } from '../../../../shared/service/coordinate.service';

@Component({
  selector: 'laji-line-transect',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectComponent implements OnChanges, AfterViewInit {

  @ViewChild(LajiMapComponent)
  public lajiMap: LajiMapComponent;
  @Input()
  public namedPlace: NamedPlace;
  @Input()
  public person: Person;

  public lajiMapOptions: LajiMap.Options;
  public biotopes: {[distRow: number]: string[]};
  public pages: number[][] = [];
  public total: number;
  public routeLength: number;
  public neDistance: any = 0;
  public ykjGrid: string;
  public info: {key: string, data: string}[];
  public formSplit = 50;
  public landscape = false;
  public startPoint = {lat: 0, lng: 0};
  public bounds = {
    'ne': {lat: 0, lng: 0},
    'sw': {lat: 0, lng: 0}
  };

  private pageSize = 10;

  constructor(
    private coordinateService: CoordinateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    const baseDoc = this.namedPlace.acceptedDocument || this.namedPlace.prepopulatedDocument || {};
    if (
      baseDoc.gatheringEvent && baseDoc.gatheringEvent.startDistanceFromNECorner
    ) {
      this.neDistance = baseDoc.gatheringEvent.startDistanceFromNECorner;
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
    const baseDoc = this.namedPlace.acceptedDocument || this.namedPlace.prepopulatedDocument || {};
    const biotopes: {[distRow: number]: string[]} = {};
    const pages: number[][] = [];
    let total = 0;
    let currentPage = 0;
    let current = 0;
    let minLat =  9999999, maxLat = 0, minLng = 9999999, maxLng = 0;
    let startPoint = {lat: 0, lng: 0};
    geometries.coordinates.forEach((coord, idx) => {
      if (Array.isArray(coord) && coord.length > 0) {
        coord.forEach((val, coordIdx) => {
          const ykjPoint = this.getYkj(val[1], val[0]);
          if (idx === 0 && coordIdx === 0) {
            startPoint = ykjPoint;
          }
          if (ykjPoint.lng < minLng) {
            minLng = ykjPoint.lng;
          }
          if (ykjPoint.lng > maxLng) {
            maxLng = ykjPoint.lng;
          }
          if (ykjPoint.lat < minLat) {
            minLat = ykjPoint.lat;
          }
          if (ykjPoint.lat > maxLat) {
            maxLat = ykjPoint.lat;
          }
        });
      }
      const dist = MapUtil.getLineTransectStartEndDistancesForIdx({geometry: geometries} as any, idx, 10);
      const biotopeSlot = current === dist[0] ? current : current - this.formSplit;
      if (!biotopes[biotopeSlot]) {
        biotopes[biotopeSlot] = [];
      }
      let biotope = '_________';
      if (baseDoc.gatherings && baseDoc.gatherings[idx] && baseDoc.gatherings[idx].habitatClassification) {
        biotope = baseDoc.gatherings[idx].habitatClassification;
      }
      biotopes[biotopeSlot].unshift(biotope + (current !== dist[0] ?  ' (' + dist[0] + 'm.)' : ''));
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
    this.startPoint = startPoint;
    this.bounds = {
      sw: {lat: minLat, lng: minLng},
      ne: {lat: maxLat, lng: maxLng}
    };
    if (pages[currentPage]) {
      if (pages[currentPage][0] > total) {
        pages[currentPage][0] = total;
      }
    }
    this.biotopes = biotopes;
    this.lajiMap.map.zoomToData({paddingInMeters: 200});
    this.lajiMap.map.map.dragging.disable();
    this.lajiMap.map.map.touchZoom.disable();
    this.lajiMap.map.map.doubleClickZoom.disable();
    this.lajiMap.map.map.scrollWheelZoom.disable();
    this.lajiMap.map.map.boxZoom.disable();
    this.lajiMap.map.map.keyboard.disable();
    if (this.lajiMap.map.map.tap) {
      this.lajiMap.map.map.tap.disable();
    }
    setTimeout(() => {
      this.pages = pages;
      this.total = pages.length;
      this.routeLength = total;
      this.cdr.markForCheck();
    });
  }

  private initMapOptions() {
    const geometry = this.getGeometry();
    this.checkOrientation(geometry);
    this.lajiMapOptions = {
      tileLayerName: LajiMap.TileLayer.maastokartta,
      tileLayerOpacity: 0.5,
      lineTransect: {
        printMode: true,
        feature: {geometry: geometry}
      }
    };
  }

  private getYkj(lat, lng): {lat: number, lng: number} {
    const coord = this.coordinateService.convertWgs84ToYkj(lat, lng).map(val => Math.round(val / 10) * 10);
    return {
      lat: coord[1],
      lng: coord[0]
    }
  }

  private checkOrientation(geometries) {
    let minX = 999, maxX = 0, minY = 999, maxY = 0;
    geometries.coordinates.forEach(coord => {
      if (Array.isArray(coord) && Array.isArray(coord[0]) && typeof coord[0][0] === 'number') {
        coord.forEach(point => {
          if (point[0] > maxX) {
            maxX = point[0];
          }
          if (point[0] < minX) {
            minX = point[0];
          }
          if (point[1] > maxY) {
            maxY = point[1];
          }
          if (point[1] < minY) {
            minY = point[1];
          }
        })
      }
    });

    const diffX = (maxX - minX) / 2;
    const diffY = maxY - minY;
    this.landscape = diffX > diffY;
  }

  private getGeometry(): any {
    if (this.namedPlace.acceptedDocument && this.namedPlace.acceptedDocument.gatherings) {
      return {type: 'MultiLineString', coordinates: this.namedPlace.acceptedDocument.gatherings.map(item => item.geometry.coordinates)};
    }
    if (this.namedPlace.prepopulatedDocument && this.namedPlace.prepopulatedDocument.gatherings) {
      return {type: 'MultiLineString', coordinates: this.namedPlace.prepopulatedDocument.gatherings.map(item => item.geometry.coordinates)};
    }
    return {};
  }

}
