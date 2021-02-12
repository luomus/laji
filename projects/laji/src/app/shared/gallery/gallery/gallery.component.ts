import { Observable } from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { GalleryService } from '../service/gallery.service';
import { TaxonomyImage } from '../../model/Taxonomy';
import { WarehouseQueryInterface } from '../../model/WarehouseQueryInterface';
import { Logger } from '../../logger/logger.service';
import {catchError, delay, map, tap} from 'rxjs/operators';
import { IImageSelectEvent } from '../image-gallery/image.interface';
import { QueryParamsHandling } from '@angular/router';

@Component({
  selector: 'laji-gallery',
  styleUrls: ['./gallery.component.css'],
  templateUrl: './gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() extendedInfo = false;
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
  @Input() shortcut: boolean;
  @Input() linkOptions: {tab: string, queryParams: any, queryParamsHandling: QueryParamsHandling};
  @Input() sort: string[];
  @Input() view: 'compact'|'annotation'|'full'|'full2' = 'compact';
  @Input() views = ['compact', 'full'];
  @Output() selected = new EventEmitter<IImageSelectEvent>();
  @Output() hasData = new EventEmitter<boolean>();

  page = 1;
  total = 0;
  loading = false;
  paginatorNeeded = false;

  images$: Observable<TaxonomyImage[]>;

  constructor(
    private logger: Logger,
    private galleryService: GalleryService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['query'] ||
      changes['pageSize'] ||
      changes['limit'] ||
      changes['sort']
    ) {
      this.page = 1;
      this.updateImages();
    }
  }

  pageChanged(event) {
    this.page = event.page;
    this.updateImages();
  }

  updateImages() {
    if (!this.query) {
      return;
    }

    this.loading = true;

    this.images$ = this.galleryService.getList(this.query, this.sort, this.pageSize, this.page)
      .pipe(
        delay(0),
        map(result => {
        this.total = Math.min(result.total, this.limit);
        this.paginatorNeeded = this.total > this.pageSize;
        return this.galleryService.getImages(result, this.limit);
      }),
      catchError(err => {
        this.logger.error('Unable to fetch image from warehouse', err);
        return [];
      }),
      tap((images: TaxonomyImage[]) => {
        this.loading = false;
        this.hasData.emit(images.length > 0);
        this.cdr.detectChanges();
      })
    );
  }
}
