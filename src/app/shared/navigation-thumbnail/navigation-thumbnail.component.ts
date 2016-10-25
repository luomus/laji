import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-navigation-thumbnail',
  template: `
  <div class="col-md-6">
    <a [routerLink]="'/' + path" class="thumbnail">
      <div class="tile">
        <div class="icon" [style.background-image]="'url(/static/images/icons/' + icon + '.svg)'"></div>
        <div class="caption">
          <h5>{{ name | translate }}</h5>
        </div>
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
