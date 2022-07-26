import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { zip } from 'rxjs';
import { Collection } from '../../shared/model/Collection';
import { CollectionService, ICollectionCounts } from '../../shared/service/collection.service';

@Component({
  selector: 'laji-dataset-metadata',
  templateUrl: './dataset-metadata.component.html',
  styleUrls: ['./dataset-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataComponent implements OnInit {
  collectionId: string;
  _collectionId: string;
  collection: Collection;
  collectionCounts: ICollectionCounts;
  loading = false;
  showBrowser = true;

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const routeCollectionId = this.route.snapshot.paramMap.get('collectionId')

    if (routeCollectionId) {
      this.showBrowser = false;
      this.collectionId = routeCollectionId;
      this.getCollectionData();
    }
  }

  getCollectionData() {
    if (this.collectionId && this.collectionId !== this._collectionId) {
      this.loading = true;
      zip(
        this.collectionService.getById(this.collectionId, 'multi'),
        this.collectionService.getCollectionSpecimenCounts(this.collectionId)
      ).subscribe(([ collection, collectionCounts ]) => {
        this.collection = collection;
        this.collectionCounts = collectionCounts;
        this.loading = false;

        this.cd.markForCheck();

      })
    }
  }

  getSpecimenCounts() {

  }

  changeCollection(collectionId) {
    this.collectionId = collectionId;
    this.getCollectionData();
  }
}
