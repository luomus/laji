import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Collection } from '../../shared/model/Collection';
import { CollectionService, ICollectionCounts } from '../../shared/service/collection.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';

const mobileBreakpoint = 768;

@Component({
  selector: 'laji-dataset-metadata',
  templateUrl: './dataset-metadata.component.html',
  styleUrls: ['./dataset-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataComponent implements OnInit, OnDestroy, AfterViewInit {
  collectionId: string;
  _collectionId: string;
  collection$: Observable<Collection>;
  collectionCounts$: Observable<ICollectionCounts>;
  paramSub$: Subscription;
  showBrowser = true;
  isMobile = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private collectionService: CollectionService,
    private cd: ChangeDetectorRef
  ) { }

  private checkScreenWidth() {
    this.isMobile = window.innerWidth < mobileBreakpoint;
  }

  ngOnInit() {
    this.checkScreenWidth();

    const routeCollectionId = this.route.snapshot.paramMap.get('collectionId');

    if (routeCollectionId) {
      this.setCollection(routeCollectionId)
    }

    if (this.isMobile) {
      this.showBrowser = false;
    }

    this.paramSub$ = this.route.params.subscribe(params => {
      this.setCollection(params.collectionId);
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this.paramSub$?.unsubscribe();
  }

  ngAfterViewInit() {
    const routeCollectionId = this.route.snapshot.paramMap.get('collectionId');

    if (this.isMobile && !routeCollectionId) {
      this.showBrowser = true;
    }
  }

  private setCollection(collectionId: string) {
    if (collectionId && this.collectionId !== collectionId) {
      this.collection$ = this.collectionService.getById$(collectionId, 'multi');
      this.collectionCounts$ = this.collectionService.getCollectionSpecimenCounts$(collectionId);
    }

    this.collectionId = collectionId;
  }

  private changeUrl(collectionId: string) {
    const url = this.localizeRouterService.translateRoute(['/theme', 'dataset-metadata']);

    if (collectionId) {
      url.push(collectionId);
    }

    this.router.navigate(url);
  }

  changeCollection(collectionId) {
    if (!collectionId || collectionId !== this.collectionId) {
      this.changeUrl(collectionId);
    }

    if(this.isMobile) {
      this.showBrowser = false;
    }
  }
}
