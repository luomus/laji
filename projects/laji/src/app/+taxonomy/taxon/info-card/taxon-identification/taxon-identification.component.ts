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

interface TaxonomyWithDescriptionsAndMultimedia extends Taxonomy {
  taxonDescriptions: Record<string, any>;
  taxonMultimedia: Record<string, any>;
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

  @Input() taxon: Taxonomy;

  @ViewChild('loadMore') loadMoreElem: ElementRef;

  children: TaxonomyWithDescriptionsAndMultimedia[] = [];
  totalChildren$: Observable<number> = this.facade.totalChildren$;
  loading = true;
  descriptionSources: Array<string> = [];
  speciesCardAuthors: Array<string> = [];
  speciesCardAuthorsTitle: string | undefined = undefined;

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

  private parseTaxonDescriptions(child: Taxonomy) {
    if (!child.descriptions || child.descriptions.length < 1) { return undefined; }

    const descriptions = child.descriptions;
    const taxonDescriptions = {};

    const requestedVariables = {
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

    descriptions.forEach(description => {
      description.groups.forEach(group => {
        if (Object.keys(requestedVariables).includes(group.group)) {
          group.variables.forEach(variable => {
            if (requestedVariables[group.group].includes(variable.variable) && !taxonDescriptions[variable.variable]) {
              const title = variable.title;
              const content = variable.content;
              taxonDescriptions[variable.variable] = { title, content };

              if (description.title && !this.descriptionSources.includes('<p>' + description.title + '</p>')) {
                this.descriptionSources.push('<p>' + description.title + '</p>');
              }

              if (description.speciesCardAuthors && !this.speciesCardAuthors.includes(description.speciesCardAuthors.content)) {
                this.speciesCardAuthors.push(description.speciesCardAuthors.content);
                if (!this.speciesCardAuthorsTitle) {
                  this.speciesCardAuthorsTitle = description.speciesCardAuthors.title;
                }
              }
            }
          });
        }
      });
    });

    return taxonDescriptions;
  }

  private parseTaxonMultimedia(child: Taxonomy) {
    if (!child.multimedia || child.multimedia.length < 0) { return undefined; }

    const mainImage = child.multimedia[0];
    const taxonMultimedia = {};

    if (mainImage.copyrightOwner) { taxonMultimedia['copyrightOwner'] = mainImage.copyrightOwner; }
    if (mainImage.licenseAbbreviation) { taxonMultimedia['licenseAbbreviation'] = mainImage.licenseAbbreviation; }
    if (mainImage.licenseId) { taxonMultimedia['licenseId'] = mainImage.licenseId; }
    if (mainImage.taxonDescriptionCaption) { taxonMultimedia['taxonDescriptionCaption'] = mainImage.taxonDescriptionCaption; }

    return taxonMultimedia;
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
        this.children = t.map(child => {
          const taxonDescriptions = this.parseTaxonDescriptions(child);
          const taxonMultimedia = this.parseTaxonMultimedia(child);
          return { ...child, taxonDescriptions, taxonMultimedia };
        });
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
