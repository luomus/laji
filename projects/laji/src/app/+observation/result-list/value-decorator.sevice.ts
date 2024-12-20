import { Injectable } from '@angular/core';
import { LabelPipe } from '../../shared/pipe/label.pipe';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { SourceService } from '../../shared/service/source.service';
import { CollectionNamePipe } from '../../shared/pipe/collection-name.pipe';
import { FormattedNumber } from '../../shared/pipe/formated-number.pipe';
import { QualityUrlPipe } from '../../shared/pipe/quality-url.pipe';
import { DateFormatPipe } from 'ngx-moment';

@Injectable()
export class ValueDecoratorService {

  public lang = 'fi';

  private decoratable: Record<string, string> = {
    'document.createdDate': 'makeDate',
    'gathering.eventDate': 'makeDateRange',
    'gathering.team': 'makeArrayToSemiColon',
    'unit.taxonVerbatim': 'makeTaxonLocal',
    'unit.linkings.taxon': 'makeTaxon',
    'unit.quality.taxon': 'makeTaxonQuality',
    'gathering.conversions.wgs84CenterPoint': 'makeMapPoint',
    'document.secureLevel': 'makeSecure',
    'unit.sex': 'makeLabel',
    'unit.lifeStage': 'makeLabel',
    'unit.recordBasis': 'makeLabel',
    'unit.reportedTaxonConfidence': 'makeLabel',
    'document.secureReasons': 'makeLabelFromArray',
    'document.collectionId': 'makeCollectionName',
    'document.sourceId': 'makeSourceName',
    'gathering.conversions.ykj1kmCenter': 'makeYkj',
    'gathering.conversions.ykj': 'makeMinMaxYkj',
    'gathering.conversions.wgs84': 'makeMinMaxCoordinate',
    'gathering.conversions.euref': 'makeMinMaxCoordinate',
    'gathering.interpretations.coordinateAccuracy': 'makeLongNumber',
    'unit.interpretations.recordQuality': 'makeIcon',
    'document.linkings.collectionQuality': 'makeIcon'
  };

  constructor(
    private datePipe: DateFormatPipe,
    private labelPipe: LabelPipe,
    private toQNamePipe: ToQNamePipe,
    private source: SourceService,
    private collectionName: CollectionNamePipe,
    private numberFormater: FormattedNumber,
    private qualityUrlPipe: QualityUrlPipe
  ) {
  }

  public isDecoratable(field: string) {
    return typeof this.decoratable[field] !== 'undefined';
  }

  public decorate(field: string, value: any, context: any) {
    if (!this.isDecoratable(field)) {
      return value;
    }
    return (this as any)[this.decoratable[field]](value, context);
  }

  protected makeJson(value: any) {
    return JSON.stringify(value);
  }

  protected makeDateRange(value: any) {
    if (value.begin !== value.end) {
      return `${this.makeDate(value.begin)} - ${this.makeDate(value.end)}`;
    }
    return this.makeDate(value.begin);
  }

  protected makeDate(value: any) {
    return this.datePipe.transform(value, 'DD.MM.YYYY');
  }

  protected makeArrayToSemiColon(value: any[]) {
    return value.join('; ');
  }

  protected makeLongNumber(value: any) {
    return this.numberFormater.transform(value, '&nbsp;') || '';
  }

  protected makeSecure(value: any) {
    if (value === 'NONE') {
      return '';
    }
    return this.makeLabel(value);
  }

  protected makeLabelFromFullUri(value: any) {
    return this.makeLabel(this.toQNamePipe.transform(value));
  }

  protected makeTaxonQuality(value: any) {
    if (!value && !value.reliability) {
      return '';
    }
    return this.makeLabel(value.reliability);
  }

  protected makeCollectionName(value: any) {
    return this.collectionName.transform(this.toQNamePipe.transform(value));
  }

  protected makeSourceName(value: any) {
    return this.source.getName(this.toQNamePipe.transform(value), this.lang);
  }

  protected makeLabelFromArray(value: any[]) {
    return value.map(val => ' ' + this.makeLabel(val));
  }

  protected makeLabel(value: any) {
    return this.labelPipe.transform(value, 'warehouse');
  }

  protected makeYkj(value: any) {
    if (value && value.lat && value.lon) {
      return `${value.lat}:${value.lon}`;
    }
    return '';
  }

  protected makeMinMaxCoordinate(value: any) {
    if (value && value.latMax && value.latMin && value.lonMax && value.lonMin) {
      const lat = value.latMax === value.latMin ? value.latMax : value.latMin + '-' + value.latMax;
      const lon = value.lonMax === value.lonMin ? value.lonMax : value.lonMin + '-' + value.lonMax;
      return `${lat} ${lon}`;
    }
    return '';
  }

  protected makeMinMaxYkj(value: any) {
    if (value && value.latMin) {
      const lat = this.getYkjCoord(value.latMin, value.latMax);
      return lat + ':' + this.getYkjCoord(value.lonMin, value.lonMax, lat.split('-')[0].length);
    }
    return '';
  }

  protected getYkjCoord(min: number, max: number, minLen = 3) {
    let tmpMin = ('' + min).replace(/[0]*$/, '');
    let tmpMax = ('' + max).replace(/[0]*$/, '');
    const targetLen = Math.max(tmpMin.length, tmpMax.length, minLen);
    tmpMin = tmpMin + '0000000'.substr(tmpMin.length, (targetLen - tmpMin.length));
    tmpMax = '' + (+(tmpMax + '0000000'.substr(tmpMax.length, (targetLen - tmpMax.length))) - 1);
    return tmpMin === tmpMax ? tmpMin : tmpMin + '-' + tmpMax;
  }

  protected makeArrayToBr(value: any[]) {
    return value.join('<br>');
  }

  protected makeMapPoint(value: any) {
    // TODO: return image with center marked to these coordinates
    return (+value.lat.toFixed(6)) + ' : ' + (+value.lon.toFixed(6));
  }

  protected makeTaxonLocal(value: any, context: any) {
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

  protected makeTaxon(value: any): any {
    let result = '';
    if (value.qname || value.id) {
      result += value.vernacularName && value.vernacularName[this.lang] ?
        value.vernacularName[this.lang] : '';
      result += ' <i class="scientificName">(' + value.scientificName + ')</i>';
    }
    return result;
  }

  protected makeIcon(value: any): any {
    return '<img style="height:15px;width:15px;margin-right:5px" src="' +
      this.qualityUrlPipe.transform(value) + '">' +
      this.labelPipe.transform(value, 'warehouse');
  }
}
