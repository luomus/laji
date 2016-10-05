import { Component, Input } from '@angular/core';

@Component({
  selector: 'result-list-element',
  templateUrl: 'result-list-element.component.html'
})
export class ResultListElementComponent {
  @Input() data: string|{};

  isPlain() {
    return typeof this.data !== 'object'
  }

}
