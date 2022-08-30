import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { zip, Observable } from 'rxjs';
import { Collection } from '../../shared/model/Collection';
import { CollectionService, ICollectionCounts } from '../../shared/service/collection.service';

const mobileBreakpoint = 768;

@Component({
  selector: 'laji-dataset-metadata',
  templateUrl: './dataset-metadata.component.html',
  styleUrls: ['./dataset-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataComponent implements OnInit, AfterViewInit {
  collectionId: string;
  _collectionId: string;
  collection$: Observable<Collection>;
  collectionCounts$: Observable<ICollectionCounts>;
  showBrowser = true;
  isMobile = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private collectionService: CollectionService,
    private cd: ChangeDetectorRef
  ) { }

  checkScreenWidth() {
    this.isMobile = window.innerWidth < mobileBreakpoint;
  }

  ngOnInit() {
    this.checkScreenWidth()

    const routeCollectionId = this.route.snapshot.paramMap.get('collectionId')

    if (routeCollectionId) {
      this.collectionId = routeCollectionId;
      this.getCollectionData();
    }

    if (this.isMobile) {
      this.showBrowser = false;
    }
  }

  ngAfterViewInit() {
    const routeCollectionId = this.route.snapshot.paramMap.get('collectionId');

    if (this.isMobile && !routeCollectionId) {
      this.showBrowser = true;
    }
  }

  getCollectionData() {
    if (this.collectionId && this.collectionId !== this._collectionId) {
      this.collection$ = this.collectionService.getById(this.collectionId, 'multi'),
      this.collectionCounts$ = this.collectionService.getCollectionSpecimenCounts(this.collectionId)

      this.cd.markForCheck();
    }
  }

  getSpecimenCounts() {

  }

  changeUrl(collectionId) {
    if (collectionId) {
      const url = this.router.createUrlTree(['theme', 'dataset-metadata', collectionId]).toString();
      this.location.go(url)
      this.route.params['collectionId'] = collectionId
    } else {
      this.location.go('theme/dataset-metadata')
      this.route.params['collectionId'] = undefined
    }
  }

  changeCollection(collectionId) {
    if (!collectionId || collectionId !== this.collectionId) {
      this.changeUrl(collectionId);
    }

    this.collectionId = collectionId;
    this.getCollectionData();

    if(this.isMobile) {
      this.showBrowser = false;
    }
  }
}
