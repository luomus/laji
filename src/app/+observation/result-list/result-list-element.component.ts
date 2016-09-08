import {Component, OnInit, Input} from '@angular/core';
import {ROUTER_DIRECTIVES} from "@angular/router";

@Component({
  moduleId: module.id,
  selector: 'result-list-element',
  templateUrl: 'result-list-element.component.html',
  directives: [ROUTER_DIRECTIVES]
})
export class ResultListElementComponent {
  @Input() data:string|{};

  isPlain() {
    return typeof this.data !== 'object'
  }

}
