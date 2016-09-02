import { Component } from '@angular/core';
import {CAROUSEL_DIRECTIVES} from "ng2-bootstrap/ng2-bootstrap";

import { StatItemComponent } from './stat-item.component'
import {ObservationCountComponent} from "../../+observation/count/observation-cont.component";

@Component({
  selector: 'laji-image-header',
  templateUrl: './image-header.component.html',
  styleUrls: ['./image-header.component.css'],
  directives: [
    StatItemComponent,
    CAROUSEL_DIRECTIVES,
    ObservationCountComponent
  ]
})
export class ImageHeaderComponent {

}
