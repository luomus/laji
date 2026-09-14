import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { map } from 'rxjs';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { queryParameterToIntList } from '../../bsg-shared/service/bsg-utils';
import { IdentificationMainComponent } from '../../bsg-shared-modules/identification/identification-main/identification-main.component';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

@Component({
    selector: 'bsg-recording-identification',
    templateUrl: './recording-identification.component.html',
    styleUrls: ['./recording-identification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class RecordingIdentificationComponent implements OnInit, OnDestroy {
  @ViewChild(IdentificationMainComponent) identificationComponent?: IdentificationMainComponent;

  expertiseMissing?: boolean;
  selectedSites?: number[];

  private expertiseMissingSub!: Subscription;
  private siteIdsSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private api: LajiApiClientService
  ) {}

  ngOnInit() {
    this.expertiseMissingSub = this.api.get('/person/profile').subscribe(profile => {
      this.expertiseMissing = !profile.birdwatchingActivityLevel || !profile.birdSongRecognitionSkillLevels?.length;
      this.cdr.markForCheck();
    });

    this.siteIdsSub = this.route.queryParams.pipe(
      map(data => (queryParameterToIntList(data['siteId'])))
    ).subscribe(siteIds => {
      this.selectedSites = siteIds;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.expertiseMissingSub?.unsubscribe();
    this.siteIdsSub?.unsubscribe();
  }

  canDeactivate(): Observable<boolean> | undefined {
    return this.identificationComponent?.canDeactivate();
  }

  onSiteSelect(siteIds: number[]) {
    const queryParams: Params = {};
    if (siteIds?.length > 0) {
      queryParams['siteId'] = siteIds.sort().join(',');
    }
    this.router.navigate([], { queryParams });
  }
}
