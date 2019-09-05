import { Component } from '@angular/core';

@Component({
  templateUrl: `./ui-components.component.html`,
  styleUrls: ['./ui-components.component.scss']
})
export class UiComponentsComponent {
  testDisable = false;

  onDisable() {
    this.testDisable = !this.testDisable;
  }
}
