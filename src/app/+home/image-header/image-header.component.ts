import { Component } from '@angular/core';

import { StatItemComponent } from './stat-item.component'

@Component({
  selector: 'laji-image-header',
  templateUrl: './image-header.component.html',
  styleUrls: ['./image-header.component.css'],
  directives: [ StatItemComponent ]
})
export class ImageHeaderComponent {

}
