import { Injectable } from '@angular/core';

@Injectable()
export class ValueDecoratorService {

  private lang = 'fi';

  private decoratable = {
    'document.documentId':'makeId',
    'gathering.eventDate':'makeDateRange',
    'gathering.team': 'makeArrayToBr',
    'unit.taxonVerbatim': 'makeTaxon',
    'gathering.conversions.wgs84CenterPoint': 'makeMapPoint'
  };

  public isDecoratable(field:string) {
    return typeof this.decoratable[field] !== "undefined";
  }

  public decorate(field:string, value:any, context:any) {
    if (!this.isDecoratable(field)) {
      return value;
    }
    return this[this.decoratable[field]](value, context);
  }

  protected makeDateRange(value) {
    if (value.begin !== value.end) {
      return `${value.begin} - ${value.end}`
    }
    return `${value.begin}`
  }

  protected makeId(value) {
    return `<a href="${value}">link</a><iframe src="http://laji.fi" style="width:100px; height: 100px"></iframe>`
  }

  protected makeArrayToBr(value) {
    return value.join('<br>')
  }

  protected makeMapPoint(value) {
    //TODO: return image with center marked to these coordinates
    return (+value.lat.toFixed(6)) + ' : ' + (+value.lon.toFixed(6));
  }

  protected makeTaxon(value, context) {
    if (
      context.unit.linkings &&
      context.unit.linkings.taxon &&
      context.unit.linkings.taxon.scientificName
    ) {
      let taxon = context.unit.linkings.taxon;
      if (typeof taxon.vernacularName[this.lang] !== "undefined") {
        return taxon.vernacularName[this.lang];
      }
      return taxon.scientificName;
    }
    return value;
  }
}
