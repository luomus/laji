import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-iucn-class',
  templateUrl: './iucn-class.component.html',
  styleUrls: ['./iucn-class.component.scss']
})
export class IucnClassComponent {

  @Input() includeOther = true;
  @Input() highlight;

}
