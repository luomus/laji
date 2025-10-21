import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PersonApi } from '../../../../../laji/src/app/shared/api/PersonApi';
import { IdentificationMainComponent } from '../../kerttu-global-shared-modules/identification/identification-main/identification-main.component';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Component({
  selector: 'bsg-recording-identification',
  templateUrl: './recording-identification.component.html',
  styleUrls: ['./recording-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private api: LajiApiClientBService
  ) {}

  ngOnInit() {
    this.expertiseMissingSub = this.api.get('/person/profile').subscribe(profile => {
      this.expertiseMissing = !profile.birdwatchingActivityLevel || !profile.birdSongRecognitionSkillLevels?.length;
      this.cdr.markForCheck();
    });

    this.siteIdsSub = this.route.queryParams.pipe(
      map(data => (
        (data['siteId'] || '').split(',').map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id)))
      )
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
