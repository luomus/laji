import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-navigation-thumbnail',
  templateUrl: './navigation-thumbnail.component.html',
  styleUrls: ['./navigation-thumbnail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationThumbnailComponent {
  @Input() icon: string;
  @Input() name: string;
  @Input() path: string;
  @Input() query: any;
  @Input() info: string;
  @Input() intro: string;
  @Input() iconType: 'svg'|'png' = 'svg';
  @Input() bodyHeight: string;
}
