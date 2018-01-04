import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-navigation-thumbnail',
  template: `
  <div class="col-md-4">
    <a [routerLink]="'/' + path | localize" class="thumbnail panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title caption">{{ name | translate }}</h3>
      </div>
        <div class="panel-body">
          <div class="icon" [style.background-image]="'url(/static/images/icons/' + icon + '.svg)'"></div>
        </div>
    </a>
  </div>
`, styleUrls: ['./navigation-thumbnail.component.css'],

})
export class NavigationThumbnailComponent {
  @Input() icon: string;
  @Input() name: string;
  @Input() path: string;
}
