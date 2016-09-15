import {Component, Input, OnInit} from '@angular/core';
import {Location} from '@angular/common';

import { SearchQuery } from "../search-query.model";
import {IdService} from "../../shared/service/id.service";
import {CoordinateService} from "../../shared/service/coordinate.service";
import {UserService} from "../../shared/service/user.service";


@Component({
  selector: 'laji-observation-result',
  templateUrl: 'observation-result.component.html'
})
export class ObservationResultComponent implements OnInit {

  @Input() active:string = 'list';

  public lang = 'fi';
  public selectColor = '#009900';

  public activated = {
    list: false,
    images: false,
    stats: false
  };

  constructor(
    public searchQuery: SearchQuery,
    public userService:UserService,
    private location: Location
  ) {}

  ngOnInit() {
    this.activated[this.active] = true;
  }

  pickValue(aggr, lang) {
    switch (lang) {
      case 'fi':
        return aggr['unit.linkings.taxon.nameFinnish'] || aggr['unit.linkings.taxon.scientificName'] || '';
      case 'en':
        return aggr['unit.linkings.taxon.nameEnglish'] || aggr['unit.linkings.taxon.scientificName'] || '';
      case 'sv':
        return aggr['unit.linkings.taxon.nameSwedish'] || aggr['unit.linkings.taxon.scientificName'] || '';
    }
    return aggr['unit.linkings.taxon.scientificName'] || '';
  }

  pickLink(aggr) {
    if (!aggr['unit.linkings.taxon.id']) {
      return undefined;
    }
    return {
      local: '/taxon/' + IdService.getId(aggr['unit.linkings.taxon.id']),
      content: '<i class="glyphicon glyphicon-modal-window"></i>'
    }

  }

  pickLocation(e) {
    if (e.layer.feature.properties.selected) {
      e.layer.setStyle({ color: e.layer.options.origColor });
      e.layer.feature.properties.selected = false;
      this.searchQuery.query.coordinates = undefined;
    } else {
      this.searchQuery.query.coordinates = [];
      e.target.eachLayer((layer) => {
        if (layer.feature.properties.selected) {
          layer.feature.properties.selected = false;
          layer.setStyle({ color: layer.options.origColor })
        }
      });
      e.layer.setStyle({ color: this.selectColor });
      e.layer.feature.properties.selected = true;
      if (
        e.layer.feature &&
        e.layer.feature.geometry &&
        e.layer.feature.geometry.coordinates
      ) {
        this.searchQuery.query.coordinates.push(CoordinateService.getWarehouseQuery(e.layer.feature.geometry.coordinates));
      }
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  activate(tab:string) {
    if (this.active === tab) {
      return;
    }
    this.active = tab;
    this.activated[tab] = true;
    this.searchQuery.updateUrl(this.location, '/observation/' + tab, [
      'selected',
      'pageSize',
      'includeNonValidTaxa'
    ]);
  }
}
