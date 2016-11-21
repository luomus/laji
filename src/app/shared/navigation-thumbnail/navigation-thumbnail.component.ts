import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-navigation-thumbnail',
  template: `
  <div class="col-md-6">
    <a [routerLink]="'/' + path" class="thumbnail panel panel-default">
        <div class="panel-body">
          <div class="icon" [style.background-image]="'url(/static/images/icons/' + icon + '.svg)'"></div>
        </div>
        <div class="panel-footer">
          <h3 class="panel-title caption">{{ name | translate }}</h3>
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
