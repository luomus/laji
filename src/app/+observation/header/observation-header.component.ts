import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";

import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {FormattedNumber} from "../../shared/pipe/formated-number.pipe";
import {HtmlAsIs} from "../../shared/pipe/html-as-is.pipe";
import {SpinnerComponent} from "../../shared/spinner/spinner.component";
import {ObservationCountComponent} from "../count/observation-cont.component";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-header',
  templateUrl: 'observation-header.component.html',
  directives: [ SpinnerComponent, ObservationCountComponent ],
  pipes: [FormattedNumber, HtmlAsIs]
})
export class ObservationHeaderComponent {

  public query:WarehouseQueryInterface;

  private subCount:Subscription;
  private subUpdate:Subscription;

  constructor() {
  }

  ngOnInit() {
  }

}

