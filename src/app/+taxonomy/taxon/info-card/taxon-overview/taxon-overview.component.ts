import { Component, OnChanges, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Taxonomy, TaxonomyDescription, TaxonomyImage } from '../../../../shared/model/Taxonomy';
import { GalleryService } from '../../../../shared/gallery/service/gallery.service';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-taxon-overview',
  templateUrl: './taxon-overview.component.html',
  styleUrls: ['./taxon-overview.component.scss']
})
export class TaxonOverviewComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonImages: Array<TaxonomyImage>;
  @Output() hasImageData = new EventEmitter<boolean>();

  images = [];
  ingress: any;

  private imageSub: Subscription;

  @Input() set taxonDescription(taxonDescription: Array<TaxonomyDescription>) {
    this.ingress = undefined;
    if (taxonDescription && taxonDescription.length > 0 && taxonDescription[0].id === 'default' && taxonDescription[0].groups.length > 0) {
      const desc = taxonDescription[0].groups[0];
      if (desc.variables.length > 0 && desc.variables[0].title && desc.variables[0].title['en'] === 'Ingress') {
        this.ingress = desc.variables[0].content;
      }
    }
  }

  constructor(
    private galleryService: GalleryService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.setImages();
  }

  get isFromMasterChecklist() {
    const masterChecklist = 'MR.1';
    if (!this.taxon) {
      return false;
    }
    if (this.taxon.checklist) {
      return this.taxon.checklist.indexOf(masterChecklist) > -1;
    }
    return this.taxon.nameAccordingTo === masterChecklist;
  }

  private setImages() {
    if (this.imageSub) {
      this.imageSub.unsubscribe();
    }

    this.images = [];

    const nbrOfImages = this.taxon.species ? 1 : 9;

    const taxonImages = (this.taxonImages || []).slice(0, nbrOfImages);
    let missingImages = nbrOfImages - taxonImages.length;

    let imageObs: Observable<any[]>;
    if (missingImages > 0) {
      imageObs = this.getImages(
        {
          taxonId: [this.taxon.id],
          recordBasis: ['HUMAN_OBSERVATION_PHOTO', 'HUMAN_OBSERVATION_UNSPECIFIED'],
          taxonReliability: ['RELIABLE']
        },
        missingImages
      ).pipe(
        switchMap(observationImages => {
          const images = taxonImages.concat(observationImages);
          missingImages = nbrOfImages - images.length;

          if (missingImages > 0) {
            return this.getImages(
              { taxonId: [this.taxon.id], superRecordBasis: ['PRESERVED_SPECIMEN'], sourceId: ['KE.3', 'KE.167'] },
              missingImages
            ).pipe(
              map(collectionImages => images.concat(collectionImages))
            );
          } else {
            return of(images);
          }
        }));
    } else {
      imageObs = of(taxonImages);
    }

    this.imageSub = imageObs.subscribe(images => {
      this.hasImageData.emit(images.length > 0);
      this.images = images;
      this.cd.markForCheck();
    });
  }

  private getImages(query: WarehouseQueryInterface, limit: number): Observable<any[]> {
    return this.galleryService.getList(
      query,
      undefined, limit, 1
    ).pipe(map(res => this.galleryService.getImages(res, limit)));
  }
}
