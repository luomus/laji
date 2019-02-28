import { Subscription } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { GalleryService } from '../service/gallery.service';
import { Util } from '../../service/util.service';
import { TaxonomyImage } from '../../model/Taxonomy';
import { WarehouseQueryInterface } from '../../model/WarehouseQueryInterface';
import { Logger } from '../../logger/logger.service';
import { catchError, map, tap } from 'rxjs/operators';

@Component({
  selector: 'laji-gallery',
  styleUrls: ['./gallery.component.css'],
  templateUrl: './gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() extendedInfo = false;
  @Input() tick;
  @Input() pageSize = 50;
  @Input() limit = 1000;
  @Input() showPaginator = true;
  @Input() showPaginatorOnlyWhenNeeded = false;
  @Input() shortPager = false;
  @Input() eventOnImageClick = false;
  @Input() showViewSwitch = false;
  @Input() showPopover = false;
  @Input() showOverlay = true;
  @Input() showExtraInfo = true;
  @Input() showLinkToSpeciesCard = false;
  @Input() sort: string[];
  @Input() view: 'compact'|'full'|'full2' = 'compact';
  @Input() views = ['compact', 'full'];
  @Output() selected = new EventEmitter<boolean>();
  @Output() hasData = new EventEmitter<boolean>();

  page = 1;
  total = 0;
  loading = false;
  paginatorNeeded = false;

  images: TaxonomyImage[];
  private imagesSub: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private logger: Logger,
    private galleryService: GalleryService
  ) {
  }

  ngOnChanges() {
    this.page = 1;
    this.updateImages();
  }

  pageChanged(event) {
    this.page = event.page;
    this.updateImages();
  }

  updateImages() {
    if (this.imagesSub) {
      this.imagesSub.unsubscribe();
    }

    if (!this.query) {
      return;
    }

    this.loading = true;

    this.imagesSub = this.galleryService.getList(Util.clone(this.query), this.sort, this.pageSize, this.page)
      .pipe(map(result => {
        this.total = Math.min(result.total, this.limit);
        this.paginatorNeeded = this.total > this.pageSize;
        return this.galleryService.getImages(result, this.limit);
      }),
      catchError(err => {
        this.logger.error('Unable to fetch image from warehouse', err);
        return [];
      }),
      tap((images: any[]) => {
        this.images = images;
        this.loading = false;
        this.hasData.emit(images.length > 0);
        this.cd.detectChanges();
      })
    ).subscribe();
  }
}
