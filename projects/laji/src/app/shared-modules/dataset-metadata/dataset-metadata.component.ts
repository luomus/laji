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
    private location: Location,
    private collectionService: CollectionService,
    private cd: ChangeDetectorRef
  ) { }

  checkScreenWidth() {
    this.isMobile = window.innerWidth < mobileBreakpoint;
  }

  ngOnInit() {
    this.checkScreenWidth();

    const routeCollectionId = this.route.snapshot.paramMap.get('collectionId');

    if (routeCollectionId) {
      this.collectionId = routeCollectionId;
      this.getCollectionData();
    }

    if (this.isMobile) {
      this.showBrowser = false;
    }

    this.paramSub$ = this.route.params.subscribe(params => {
      this.updateCollection(params.collectionId);
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

  getCollectionData() {
    if (this.collectionId && this.collectionId !== this._collectionId) {
      this.collection$ = this.collectionService.getById$(this.collectionId, 'multi');
      this.collectionCounts$ = this.collectionService.getCollectionSpecimenCounts$(this.collectionId);
      this._collectionId = this.collectionId;
      this.cd.markForCheck();
    }
  }

  changeUrl(collectionId) {
    let url = this.localizeRouterService.translateRoute(['/theme', 'dataset-metadata']);

    if (collectionId) {
      url = this.localizeRouterService.translateRoute(['/theme', 'dataset-metadata', collectionId]);
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

  updateCollection(collectionId) {
    this.collectionId = collectionId;
    this.getCollectionData();
  }
}
