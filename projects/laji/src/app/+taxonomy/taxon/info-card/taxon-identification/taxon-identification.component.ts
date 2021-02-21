import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { Image } from '../../../../shared/gallery/image-gallery/image.interface';
import { TaxonIdentificationFacade } from './taxon-identification.facade';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'laji-taxon-identification',
  templateUrl: './taxon-identification.component.html',
  styleUrls: ['./taxon-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonIdentificationComponent implements OnInit, OnChanges, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  @Input() taxon: Taxonomy;
  @Input() taxonImages: Array<Image>;

  childTree: Taxonomy[] = [];

  loading = false;

  constructor(private facade: TaxonIdentificationFacade, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.facade.childTree$.pipe(takeUntil(this.unsubscribe$)).subscribe(d => {
      this.childTree = d;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      if (this.taxon.taxonRank === 'MX.species') {
        this.loading = false;
        this.childTree = [];
        return;
      }
      this.loading = true;
      this.facade.loadChildTree(this.taxon);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
