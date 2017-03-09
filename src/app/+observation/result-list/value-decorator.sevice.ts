import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LabelPipe } from '../../shared/pipe/label.pipe';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { SourceService } from '../../shared/service/source.service';
import { CollectionNamePipe } from '../../shared/pipe/collection-name.pipe';

@Injectable()
export class ValueDecoratorService {

  public lang = 'fi';

  private decoratable = {
    'document.createdDate': 'makeDate',
    'gathering.eventDate': 'makeDateRange',
    'gathering.team': 'makeArrayToSemiColon',
    'unit.taxonVerbatim': 'makeTaxonLocal',
    'unit.linkings.taxon': 'makeTaxon',
    'gathering.conversions.wgs84CenterPoint': 'makeMapPoint',
    'document.secureLevel': 'makeSecure',
    'unit.sex': 'makeLabel',
    'unit.lifeStage': 'makeLabel',
    'unit.recordBasis': 'makeLabel',
    'document.secureReasons': 'makeLabelFromArray',
    'document.collectionId': 'makeCollectionName',
    'document.sourceId': 'makeSourceName',
    'gathering.conversions.ykj': 'makeYkj'
  };

  constructor(
    private datePipe: DatePipe,
    private labelPipe: LabelPipe,
    private toQNamePipe: ToQNamePipe,
    private source: SourceService,
    private collectionName: CollectionNamePipe
  ) {
  }

  public isDecoratable(field: string) {
    return typeof this.decoratable[field] !== 'undefined';
  }

  public decorate(field: string, value: any, context: any) {
    if (!this.isDecoratable(field)) {
      return value;
    }
    return this[this.decoratable[field]](value, context);
  }

  protected makeDateRange(value) {
    if (value.begin !== value.end) {
      return `${this.makeDate(value.begin)} - ${this.makeDate(value.end)}`;
    }
    return this.makeDate(value.begin);
  }

  protected makeDate(value) {
    return this.datePipe.transform(value, 'dd.MM.yyyy');
  }

  protected makeArrayToSemiColon(value) {
    return value.join('; ');
  }

  protected makeSecure(value) {
    if (value === 'NONE') {
      return '';
    }
    return this.makeLabel(value);
  }

  protected makeLabelFromFullUri(value) {
    return this.makeLabel(this.toQNamePipe.transform(value));
  }

  protected makeCollectionName(value) {
    return this.collectionName.transform(this.toQNamePipe.transform(value));
  }

  protected makeSourceName(value) {
    return this.source.getName(this.toQNamePipe.transform(value), this.lang);
  }

  protected makeLabelFromArray(value) {
    return value.map(val => this.makeLabel(val));
  }

  protected makeLabel(value) {
    return this.labelPipe.transform(value, true);
  }

  protected makeYkj(value) {
    if (value && value.latMin) {
      const lat = this.getYkjCoord(value.latMin, value.latMax);
      return lat + ':' + this.getYkjCoord(value.lonMin, value.lonMax, lat.split('-')[0].length);
    }
    return '';
  }

  protected getYkjCoord(min, max, minLen = 3) {
    let tmpMin = ('' + min).replace(/[0]*$/, '');
    let tmpMax = ('' + max).replace(/[0]*$/, '');
    const targetLen = Math.max(tmpMin.length, tmpMax.length, minLen);
    tmpMin = tmpMin + '0000000'.substr(tmpMin.length, (targetLen - tmpMin.length));
    tmpMax = '' + (+(tmpMax + '0000000'.substr(tmpMax.length, (targetLen - tmpMax.length))) - 1);
    return tmpMin === tmpMax ? tmpMin : tmpMin + '-' + tmpMax;
  }

  protected makeArrayToBr(value) {
    return value.join('<br>');
  }

  protected makeMapPoint(value) {
    // TODO: return image with center marked to these coordinates
    return (+value.lat.toFixed(6)) + ' : ' + (+value.lon.toFixed(6));
  }

  protected makeTaxonLocal(value, context) {
    if (
      context &&
      context.unit &&
      context.unit.linkings &&
      context.unit.linkings.taxon &&
      context.unit.linkings.taxon.vernacularName) {
      if (context.unit.linkings.taxon.vernacularName[this.lang]) {
        return context.unit.linkings.taxon.vernacularName[this.lang];
      } else {
        return '';
      }
    }
    return value;
  }

  protected makeTaxon(value): any {
    let result = '';
    if (value.qname) {
      result += value.vernacularName && value.vernacularName[this.lang] ?
        value.vernacularName[this.lang] : '';
      result += ' <i>(' + value.scientificName + ')</i>';
    }
    return result;
  }
}
