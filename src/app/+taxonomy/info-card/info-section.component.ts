import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-info-section',
  templateUrl: './info-section.component.html'
})
export class InfoSectionComponent {
  @Input() title:string;
  @Input() index:number;
  @Input() open:boolean = false;
  @Output() activate = new EventEmitter();

  activateCurrent() {
    this.activate.emit({
      value: this.index
    })
  }
}
