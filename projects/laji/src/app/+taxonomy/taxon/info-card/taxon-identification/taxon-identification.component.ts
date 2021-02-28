import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { Image } from '../../../../shared/gallery/image-gallery/image.interface';
import { TaxonIdentificationFacade } from './taxon-identification.facade';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'laji-taxon-identification',
  templateUrl: './taxon-identification.component.html',
  styleUrls: ['./taxon-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonIdentificationComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonImages: Array<Image>;

  childTree$ = this.facade.childTree$.pipe(tap(() => this.loading = false));
  loading = false;

  constructor(private facade: TaxonIdentificationFacade) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.loading = true;
      this.facade.loadChildTree(this.taxon);
    }
  }
}
