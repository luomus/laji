import { Injectable } from '@angular/core';
import {IdService} from "../../shared/service/id.service";

@Injectable()
export class ValueDecoratorService {

  private lang = 'fi';

  private decoratable = {
    'document.documentId':'makeId',
    'gathering.eventDate':'makeDateRange',
    'gathering.team': 'makeArrayToBr',
    'unit.taxonVerbatim': 'makeTaxonLocal',
    'unit.linkings.taxon': 'makeTaxon',
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
    return {
      linkContent: 'link',
      linkExternal: value
    }
  }

  protected makeArrayToBr(value) {
    return value.join('<br>')
  }

  protected makeMapPoint(value) {
    //TODO: return image with center marked to these coordinates
    return (+value.lat.toFixed(6)) + ' : ' + (+value.lon.toFixed(6));
  }

  protected makeTaxonLocal(value, context) {
    if (
      context.unit.linkings &&
      context.unit.linkings.taxon
    ) {
      let taxon = context.unit.linkings.taxon;
      if (typeof taxon.vernacularName[this.lang] !== "undefined") {
        return taxon.vernacularName[this.lang];
      }
    }
    return value;
  }

  protected makeTaxon(value):any {
    if (value.qname) {
      return {
        text: value.scientificName || '',
        linkInternal:'/taxon/' + IdService.getId(value.qname),
        linkContent: '<i class="glyphicon glyphicon-modal-window"></i>'
      }
    }
    return '';
  }
}
