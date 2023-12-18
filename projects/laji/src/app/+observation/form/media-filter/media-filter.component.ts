import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

const mediaGroupProps = ['hasUnitImages', 'hasUnitAudio', 'hasUnitModel'] as const;
type MediaGroupProp = typeof mediaGroupProps[number];

const allMediaGroupPropsActive = (query: WarehouseQueryInterface) =>
  mediaGroupProps.reduce((p, v) => p && query[v], true);
const activateAllMediaGroupProps = (query: WarehouseQueryInterface) =>
  mediaGroupProps.forEach(p => query[p] = true);
const deactivateAllMediaGroupProps = (query: WarehouseQueryInterface) =>
  mediaGroupProps.forEach(p => query[p] = undefined);

@Component({
  selector: 'laji-observation-form-media-filter',
  templateUrl: './media-filter.component.html',
  styleUrls: ['./media-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationFormMediaFilterComponent {
  @Input()  query: WarehouseQueryInterface;
  @Output() queryChange = new EventEmitter<void>();

  onMediaGroupPropChange(prop: MediaGroupProp, activated: boolean) {
    if (activated) {
      this.query[prop] = true;
      this.query.hasUnitMedia = undefined; // resets hasUnitMedia in case it was set to false
      // when all are active, replace with query.hasUnitMedia
      if (allMediaGroupPropsActive(this.query)) {
        this.query.hasUnitMedia = true;
        deactivateAllMediaGroupProps(this.query);
      }
    } else {
      // upon deactivating checkbox when query.hasUnitMedia is active, go back to using individual props
      if (this.query.hasUnitMedia) {
        this.query.hasUnitMedia = undefined;
        activateAllMediaGroupProps(this.query);
      }
      this.query[prop] = undefined;
    }
    this.queryChange.emit();
  }

  onToggleMedia(activated: boolean) {
    this.query.hasUnitMedia = activated ? true : undefined;
    deactivateAllMediaGroupProps(this.query);
    this.queryChange.emit();
  }

  onToggleNoImages(activated: boolean) {
    this.query.hasUnitMedia = activated ? false : undefined;
    deactivateAllMediaGroupProps(this.query);
    this.queryChange.emit();
  }

  onToggleGatheringMedia(activated: boolean) {
    this.query.hasGatheringMedia = activated ? true : undefined;
    this.queryChange.emit();
  }

  onToggleDocumentMedia(activated: boolean) {
    this.query.hasDocumentMedia = activated ? true : undefined;
    this.queryChange.emit();
  }
}
