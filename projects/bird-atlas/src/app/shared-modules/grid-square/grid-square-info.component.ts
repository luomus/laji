import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AtlasGridSquare } from '../../core/atlas-api.service';

@Component({
  selector: 'ba-grid-square-info',
  templateUrl: './grid-square-info.component.html',
  styleUrls: ['./grid-square-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridSquareInfoComponent {
  @Input() square!: AtlasGridSquare;
  activityCategoryClass = {
    'MY.atlasActivityCategoryEnum0': 'limit-neutral',
    'MY.atlasActivityCategoryEnum1': 'limit-danger',
    'MY.atlasActivityCategoryEnum2': 'limit-warning',
    'MY.atlasActivityCategoryEnum3': 'limit-success',
    'MY.atlasActivityCategoryEnum4': 'limit-success',
    'MY.atlasActivityCategoryEnum5': 'limit-success'
  };
}
