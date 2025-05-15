import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  IdentificationMainComponent
} from '../../+identification/recording-identification/identification-main/identification-main.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bsg-bat-recording-identification',
  templateUrl: './bat-recording-identification.component.html',
  styleUrls: ['./bat-recording-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatRecordingIdentificationComponent implements OnInit, OnDestroy {
  @ViewChild(IdentificationMainComponent) identificationComponent?: IdentificationMainComponent;

  selectedSpeciesIds?: number[];

  private speciesIdsSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.speciesIdsSub = this.route.queryParams.pipe(
      map(data => (
        (data['speciesId'] || '').split(',').map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id)))
      )
    ).subscribe(siteIds => {
      this.selectedSpeciesIds = siteIds;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.speciesIdsSub?.unsubscribe();
  }

  canDeactivate(): Observable<boolean> | undefined {
    return this.identificationComponent?.canDeactivate();
  }

  onSpeciesSelect(speciesIds: number[]) {
    const queryParams: Params = {};
    if (speciesIds?.length > 0) {
      queryParams['speciesId'] = speciesIds.sort().join(',');
    }
    this.router.navigate([], { queryParams });
  }
}
