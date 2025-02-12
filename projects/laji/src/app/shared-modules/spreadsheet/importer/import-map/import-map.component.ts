import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { Options, TileLayerName, DataOptions } from '@luomus/laji-map/lib/defs';
import { TranslateService } from '@ngx-translate/core';
import * as Hash from 'object-hash';

@Component({
  selector: 'laji-import-map',
  templateUrl: './import-map.component.html',
  styleUrls: ['./import-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportMapComponent implements OnChanges {
  @Input() data: {[key: string]: any}[] = [];
  @Input() colMap: {[key: string]: string} = {};
  @Input() geometryField = 'gatherings[*].geometry';
  @Input() color = '#00aa00';
  @Input() height = '100%';
  @Input() popupFields = ['gatheringEvent.dateBegin', 'gatherings[*].units[*].identifications[*].taxon'];

  mapOptions: Options = {
    tileLayerName: TileLayerName.maastokartta,
    tileLayerOpacity: 0.5,
    controls: { location: false },
    zoomToData: { maxZoom: 13 },
    popupOnHover: true
  };

  mapData!: DataOptions;

  private groupedData: {[key: string]: any}[][] = [];
  private popupColumns: string[] = [];

  constructor(
    private translateService: TranslateService
  ) { }

  ngOnChanges() {
    this.popupColumns = this.getColumns(this.popupFields);
    this.mapData = this.getMapData();
  }

  getMapData(): DataOptions {
    const geometryCol = this.getColumn(this.geometryField);
    if (!geometryCol) {
      return {};
    }

    this.groupedData = this.groupDataByGeometry(this.data, geometryCol);

    return {
      getFeatureStyle: () => ({
          weight: 2,
          opacity: 1,
          fillOpacity: 0,
          color: this.color
        }),
      featureCollection: {
        type: 'FeatureCollection',
        features: this.groupedData.map(items => ({
          type: 'Feature',
          geometry: items[0][geometryCol],
          properties: {}
        }))
      },
      getPopup: ({featureIdx, feature}, cb: (elem: string | HTMLElement) => void) => {
        const data = this.groupedData[featureIdx as any];

        return data.map(dataItem => {
          const label = '<strong>' + this.translateService.instant('excel.batch') + ' ' + dataItem._doc + ':</strong> ';
          const value = this.popupColumns.map(col => dataItem[col]).filter(text => !!text).join(' ');

          return label + value;
        }).join('<br>');
      },
      cluster: true
    };
  }

  private groupDataByGeometry(data: {[key: string]: any}[], geometryCol: string) {
    const groupedData = {};
    data.forEach((dataItem) => {
      const geometry = dataItem[geometryCol];
      if (!geometry) {
        return;
      }
      const hash = Hash.sha1(geometry);
      if (!(groupedData as any)[hash]) {
        (groupedData as any)[hash] = [];
      }
      (groupedData as any)[hash].push(dataItem);
    });

    return Object.keys(groupedData).map(hash => (groupedData as any)[hash]);
  }

  private getColumns(fields: string[]) {
    return fields.map(field => this.getColumn(field)).filter(col => !!col);
  }

  private getColumn(field: string) {
    return Object.keys(this.colMap).filter(col => this.colMap[col] === field)?.[0];
  }
}
