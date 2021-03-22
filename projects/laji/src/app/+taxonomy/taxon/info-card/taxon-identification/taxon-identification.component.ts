import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, Inject, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { TaxonIdentificationFacade } from './taxon-identification.facade';
import { Observable, merge, Subscription, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { map, switchMap, distinctUntilChanged, filter, startWith, } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { ListRange, CollectionViewer } from '@angular/cdk/collections';
import { WINDOW } from '@ng-toolkit/universal';

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

  private children$: Observable<Taxonomy[]> = this.facade.childDataSource$.pipe(
    filter(d => d !== undefined),
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
      filter(() => this.isWithinXPixelsOfViewport(this.loadMoreElem.nativeElement, INFINITE_SCROLL_DISTANCE)),
      map(() => {
        return <ListRange>{
          start: 0,
          end: this.children.length
        };
      })
    )
  };

  loading = true;

  constructor(
    private facade: TaxonIdentificationFacade,
    private cdr: ChangeDetectorRef,
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
        this.loading = false;
        this.cdr.markForCheck();
        this.totalChildren$.subscribe(total => {
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

  isInViewport(element: Element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (this.window.innerHeight || this.document.documentElement.clientHeight) &&
        rect.right <= (this.window.innerWidth || this.document.documentElement.clientWidth)
    );
  }

  isWithinXPixelsOfViewport(element: Element, px: number) {
    const rect = element.getBoundingClientRect();
    return (
      this.window.innerHeight - rect.y > -1 * px
      || this.document.documentElement.clientHeight - rect.y > -1 * px
    );
  }
}
