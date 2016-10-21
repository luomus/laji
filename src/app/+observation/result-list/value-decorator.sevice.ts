import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable()
export class ValueDecoratorService {

  public lang = 'fi';

  private decoratable = {
    'document.documentId': 'makeId',
    'unit.individualId': 'makeId',
    'gathering.eventDate': 'makeDateRange',
    'gathering.team': 'makeArrayToSemiColon',
    'unit.taxonVerbatim': 'makeTaxonLocal',
    'unit.linkings.taxon': 'makeTaxon',
    'gathering.conversions.wgs84CenterPoint': 'makeMapPoint'
  };

  constructor(private datePipe: DatePipe) {
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
      return `${this.datePipe.transform(value.begin, 'dd.MM.yyyy')} - ${this.datePipe.transform(value.end, 'dd.MM.yyyy')}`;
    }
    return `${this.datePipe.transform(value.begin, 'dd.MM.yyyy')}`;
  }

  protected makeId(value) {
    if (!value) {
      return '';
    }
    return `<span class="individualId">${value}</span>`;
  }

  protected makeArrayToSemiColon(value) {
    return value.join('; ');
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
      result += value.vernacularName[this.lang] || '';
      result += ' <i>(' + value.scientificName + ')</i>';
    }
    return result;
  }
}
