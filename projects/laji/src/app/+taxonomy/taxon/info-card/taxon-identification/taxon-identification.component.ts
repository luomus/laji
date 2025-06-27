import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges,
  ViewChild, ElementRef, Inject, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { TaxonIdentificationFacade } from './taxon-identification.facade';
import { Observable, merge, Subscription, BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { map, switchMap, distinctUntilChanged, filter, startWith, take, tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { CollectionViewer } from '@angular/cdk/collections';
import { PlatformService } from '../../../../root/platform.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

const INFINITE_SCROLL_DISTANCE = 300;

const requestedDescriptionVariables = {
  'MX.SDVG1': [
    'MX.descriptionText',
    'MX.identificationText',
    'MX.descriptionMicroscopicIdentification'
  ],
  'MX.SDVG2': [
    'MX.distributionFinland'
  ],
  'MX.SDVG4': [
    'MX.reproductionFloweringTime'
  ],
  'MX.SDVG5': [
    'MX.habitat',
    'MX.habitatSubstrate'
  ],
  'MX.SDVG8': [
    'MX.growthFormAndGrowthHabit',
    'MX.descriptionOrganismSize',
    'MX.descriptionStem',
    'MX.descriptionLeaf',
    'MX.descriptionRoot',
    'MX.descriptionFlower',
    'MX.descriptionFruitAndSeed',
    'MX.descriptionCone',
    'MX.descriptionThallus',
    'MX.descriptionFruitbody',
    'MX.descriptionSpore',
    'MX.descriptionSporangiumAndAsexualReproduction',
    'MX.algalPartnerOfLichen'
  ],
};

interface Data {
  // children: TaxonomyWithDescriptions[];
  children: (Taxon & { children: Taxon[]; taxonDescriptions: Record<string, any> })[];
  descriptionSources: Array<string>;
  speciesCardAuthors: Array<string>;
  speciesCardAuthorsTitle: string | undefined;
}

@Component({
  selector: 'laji-taxon-identification',
  templateUrl: './taxon-identification.component.html',
  styleUrls: ['./taxon-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonIdentificationComponent implements OnChanges, AfterViewInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private taxonChange$ = new BehaviorSubject<void>(undefined);

  @Input({ required: true }) taxon!: Taxon;

  @ViewChild('loadMore') loadMoreElem!: ElementRef;

  totalChildren$: Observable<number | undefined> = this.facade.totalChildren$;
  loading = true;
  data: Data = {
    children: [],
    descriptionSources: [],
    speciesCardAuthors: [],
    speciesCardAuthorsTitle: undefined
  };

  private children$: Observable<(Taxon & { children: Taxon[] })[]> = this.facade.childDataSource$.pipe(
    filter(d => d !== undefined),
    tap(() => { this.loading = false; this.cdr.markForCheck(); }),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    switchMap(d => d!.connect(this.collectionViewer)),
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
        end: this.data.children.length
      }))
    )
  };

  constructor(
    private facade: TaxonIdentificationFacade,
    private cdr: ChangeDetectorRef,
    private platformService: PlatformService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngAfterViewInit() {
    this.subscription.add(
      this.taxonChange$.subscribe(() => {
        this.data.children = [];
        this.loading = true;
        this.cdr.markForCheck();
        this.facade.loadChildDataSource(this.taxon);
      })
    );

    this.subscription.add(
      this.children$.subscribe((t) => {
        this.data.children = t.map(child => {
          const taxonDescriptions = this.parseTaxonDescriptions(child);
          return { ...child, taxonDescriptions };
        });
        this.cdr.markForCheck();
        this.totalChildren$.pipe(take(1)).subscribe(total => {
          if (this.data.children.length < (total ?? 0)) {
            setTimeout(() => this.triggerInfiniteScrollStatusCheck.next(), 0);
          }
        });
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.resetDescriptionFields();
      this.taxonChange$.next();
    }
  }

  resetDescriptionFields() {
    this.data.descriptionSources = [];
    this.data.speciesCardAuthors = [];
    this.data.speciesCardAuthorsTitle = undefined;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isWithinXPixelsOfViewport(element: Element, px: number): boolean {
    if (!this.platformService.isBrowser) { return false; }
    const rect = element.getBoundingClientRect();
    return (
      this.platformService.window.innerHeight - rect.y > -px
      || this.document.documentElement.clientHeight - rect.y > -px
    );
  }

  private parseTaxonDescriptions(taxon: Taxon): any {
    if (!taxon.descriptions || taxon.descriptions.length < 1) { return undefined; }

    const descriptions = taxon.descriptions;
    const taxonDescriptions: any = {};

    descriptions.forEach(description => {
      description.groups.forEach((group: any) => {
        if (!Object.keys(requestedDescriptionVariables).includes(group.group)) {
          return;
        }

        group.variables.forEach((variable: any) => {
          if (
            !requestedDescriptionVariables[<keyof typeof requestedDescriptionVariables>group.group].includes(variable.variable)
            || taxonDescriptions[<keyof typeof taxonDescriptions>variable.variable]
          ) {
            return;
          }

          const title = variable.title;
          const content = variable.content;
          taxonDescriptions[variable.variable] = { title, content };

          if (description.title && !this.data.descriptionSources.includes(description.title)) {
            this.data.descriptionSources.push(description.title);
          }

          if (description.speciesCardAuthors && !this.data.speciesCardAuthors.includes(description.speciesCardAuthors.content)) {
            this.data.speciesCardAuthors.push(description.speciesCardAuthors.content);
            if (!this.data.speciesCardAuthorsTitle) {
              this.data.speciesCardAuthorsTitle = description.speciesCardAuthors.title;
            }
          }
        });
      });
    });

    return taxonDescriptions;
  }
}
