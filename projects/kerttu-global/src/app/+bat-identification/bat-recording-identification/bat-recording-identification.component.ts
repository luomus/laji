import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  IdentificationMainComponent
} from '../../kerttu-global-shared-modules/identification/identification-main/identification-main.component';
import { map } from 'rxjs';
import { ComponentCanDeactivate } from '../../../../../laji/src/app/shared/guards/document-de-activate.guard';
import { queryParameterToIntList } from '../../kerttu-global-shared/service/kerttu-global-utils';

@Component({
    selector: 'bsg-bat-recording-identification',
    templateUrl: './bat-recording-identification.component.html',
    styleUrls: ['./bat-recording-identification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BatRecordingIdentificationComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(IdentificationMainComponent) identificationComponent?: IdentificationMainComponent;

  selectedSiteIds?: number[];
  selectedSpeciesIds?: number[];
  unknownSpecies = false;

  private speciesIdsSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.speciesIdsSub = this.route.queryParams.pipe(
      map(data => ({
        speciesId: queryParameterToIntList(data['speciesId']),
        unknownSpecies: data['unknownSpecies'] === 'true',
        siteId: queryParameterToIntList(data['siteId'])
      }))
    ).subscribe(({ speciesId, unknownSpecies, siteId }) => {
      this.selectedSpeciesIds = speciesId;
      this.unknownSpecies = unknownSpecies;
      this.selectedSiteIds = siteId;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.speciesIdsSub?.unsubscribe();
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.identificationComponent?.canDeactivate() || true;
  }

  onSpeciesSelect(speciesIds: (number|undefined)[]) {
    const queryParams: Params = {};
    if (speciesIds.includes(undefined)) {
      queryParams['unknownSpecies'] = true;
      speciesIds = speciesIds.filter(id => id !== undefined);
    }
    if (speciesIds?.length > 0) {
      queryParams['speciesId'] = speciesIds.sort().join(',');
    }
    if (this.selectedSiteIds && this.selectedSiteIds?.length > 0) {
      queryParams['siteId'] = this.selectedSiteIds?.sort().join(',');
    }
    this.router.navigate([], { queryParams });
  }

  onSiteChange(siteId: number|undefined) {
    this.selectedSiteIds = siteId ? [siteId] : undefined;
  }
}
