import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges,
  ViewChild, ElementRef, Inject, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { TaxonIdentificationFacade } from './taxon-identification.facade';
import { Observable, merge, Subscription, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { map, switchMap, distinctUntilChanged, filter, startWith, take, tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { CollectionViewer } from '@angular/cdk/collections';
import { WINDOW } from '@ng-toolkit/universal';
import { PlatformService } from '../../../../root/platform.service';

const INFINITE_SCROLL_DISTANCE = 300;

@Component({
  selector: 'laji-taxon-identification',
  templateUrl: './taxon-identification.component.html',
  styleUrls: ['./taxon-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonIdentificationComponent implements OnChanges, AfterViewInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private taxonChange$ = new BehaviorSubject<void>(undefined);

  @Input() taxon: Taxonomy;

  @ViewChild('loadMore') loadMoreElem: ElementRef;

  children: Taxonomy[] = [];
  totalChildren$: Observable<number> = this.facade.totalChildren$;
  loading = true;

  private children$: Observable<Taxonomy[]> = this.facade.childDataSource$.pipe(
    filter(d => d !== undefined),
    tap(() => { this.loading = false; this.cdr.markForCheck(); }),
    switchMap(d => d.connect(this.collectionViewer)),
    distinctUntilChanged()
  );

  private triggerInfiniteScrollStatusCheck = new Subject<void>();
  private infiniteScrollStatusCheck$: Observable<void> = merge(
    fromEvent(this.document, 'scroll').pipe(
      map(() => undefined),
      startWith(undefined),
    ),
    this.triggerInfiniteScrollStatusCheck.asObservable()
  );

  private collectionViewer: CollectionViewer = {
    viewChange: this.infiniteScrollStatusCheck$.pipe(
      filter(() => this.loadMoreElem && this.isWithinXPixelsOfViewport(this.loadMoreElem.nativeElement, INFINITE_SCROLL_DISTANCE)),
      map(() => ({
          start: 0,
          end: this.children.length
        }))
    )
  };

  constructor(
    private facade: TaxonIdentificationFacade,
    private cdr: ChangeDetectorRef,
    private platformService: PlatformService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private window: Window
  ) { }

  ngAfterViewInit() {
    this.subscription.add(
      this.taxonChange$.subscribe(() => {
        this.children = [];
        this.loading = true;
        this.cdr.markForCheck();
        this.facade.loadChildDataSource(this.taxon);
      })
    );

    this.subscription.add(
      this.children$.subscribe((t) => {
        this.children = t;
        this.cdr.markForCheck();
        this.totalChildren$.pipe(take(1)).subscribe(total => {
          if (this.children.length < total) {
            setTimeout(() => this.triggerInfiniteScrollStatusCheck.next(), 0);
          }
        });
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.taxonChange$.next();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isWithinXPixelsOfViewport(element: Element, px: number): boolean {
    if (!this.platformService.isBrowser) { return false; }
    const rect = element.getBoundingClientRect();
    return (
      this.window.innerHeight - rect.y > -px
      || this.document.documentElement.clientHeight - rect.y > -px
    );
  }
}
