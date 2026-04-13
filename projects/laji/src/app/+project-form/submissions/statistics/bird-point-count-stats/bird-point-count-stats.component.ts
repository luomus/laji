import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { FormService } from '../../../../shared/service/form.service';
import { components } from 'projects/laji-api-client-b/generated/api';

export type Document = components['schemas']['store-document'];
export type NamedPlace = components['schemas']['store-namedPlace'];

@Component({
    selector: 'laji-bird-point-count-stats',
    templateUrl: './bird-point-count-stats.component.html',
    styleUrls: ['./bird-point-count-stats.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BirdPointCountStatsComponent implements OnChanges {
  @Input() document!: Document;
  @Input() namedPlace!: NamedPlace;

  @Output() namedPlaceChange = new EventEmitter();

  missingNS = false;
  path = '';

  constructor(
    private formService: FormService,
  ) {}

  ngOnChanges() {
    this.missingNS = !this.namedPlace || !this.namedPlace.collectionID;
    this.initEditLink();
  }

  private initEditLink() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.path = this.formService.getEditUrlPath(this.document.formID!, this.document!.id!);
  }
}
