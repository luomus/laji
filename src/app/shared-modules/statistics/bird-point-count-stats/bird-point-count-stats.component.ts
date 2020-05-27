import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { FormService } from '../../../shared/service/form.service';

@Component({
  selector: 'laji-bird-point-count-stats',
  templateUrl: './bird-point-count-stats.component.html',
  styleUrls: ['./bird-point-count-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdPointCountStatsComponent implements OnChanges {
  @Input() document: Document;
  @Input() namedPlace: NamedPlace;

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
    this.path = this.formService.getEditUrlPath(this.document.formID, this.document.id);
  }
}
