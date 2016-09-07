import {Component} from '@angular/core';

import {FormattedNumber} from "../../shared/pipe/formated-number.pipe";
import {HtmlAsIs} from "../../shared/pipe/html-as-is.pipe";
import {SpinnerComponent} from "../../shared/spinner/spinner.component";
import {ObservationCountComponent} from "../count/observation-count.component";
import {SearchQuery} from "../search-query.model";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-header',
  templateUrl: 'observation-header.component.html',
  directives: [ SpinnerComponent, ObservationCountComponent ],
  pipes: [FormattedNumber, HtmlAsIs]
})
export class ObservationHeaderComponent {

  constructor(public searchQuery:SearchQuery) {}

}

