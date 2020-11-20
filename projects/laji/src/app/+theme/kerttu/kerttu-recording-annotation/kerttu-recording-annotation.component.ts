import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {IRecordingResponse, KerttuApi} from '../service/kerttu-api';
import {IRecording, IRecordingAnnotation, IRecordingStatusInfo, KerttuErrorEnum} from '../models';
import {UserService} from '../../../shared/service/user.service';
import {Observable, of} from 'rxjs';
import {KerttuTaxonService} from '../service/kerttu-taxon-service';
import {map, switchMap} from 'rxjs/operators';
import {PersonApi} from '../../../shared/api/PersonApi';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-recording-annotation',
  templateUrl: './kerttu-recording-annotation.component.html',
  styleUrls: ['./kerttu-recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuRecordingAnnotationComponent implements OnInit {
  recording: IRecording;
  annotation: IRecordingAnnotation;
  statusInfo: IRecordingStatusInfo;

  taxonList$: Observable<string[]>;
  taxonExpertise$: Observable<string[]>;

  firstRecordingLoaded = false;
  loading = false;

  taxonExpertiseMissing = false;
  allRecordingsAnnotated = false;
  hasError = false;

  constructor(
    private kerttuApi: KerttuApi,
    private taxonService: KerttuTaxonService,
    private userService: UserService,
    private personService: PersonApi,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading = true;
    this.kerttuApi.getRecording(this.userService.getToken()).subscribe((result) => {
      this.onGetRecordingSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
    this.taxonList$ = this.taxonService.getTaxonList().pipe(
      map(taxons => taxons.map(taxon => taxon.id))
    );
    this.taxonExpertise$ = this.personService.personFindProfileByToken(this.userService.getToken()).pipe(map(profile => {
      return profile.taxonExpertise || [];
    }));
  }

  getNextRecording() {
    this.loading = true;
    this.kerttuApi.saveRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).pipe(
      switchMap(() => {
        return this.kerttuApi.getNextRecording(this.userService.getToken(), this.recording.id);
      })
    ).subscribe(result => {
      this.onGetRecordingSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
  }

  getPreviousRecording() {
    this.kerttuApi.getPreviousRecording(this.userService.getToken(), this.recording.id).subscribe(result => {
      this.onGetRecordingSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
  }

  save() {
    if (!this.recording || !this.annotation) {
      return;
    }

    this.loading = true;
    this.kerttuApi.saveRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).subscribe(() => {
      this.loading = false;
      this.cdr.markForCheck();
    }, (err) => {
      this.handleError(err);
    });
  }

  addToTaxonExpertise(taxonId: string) {
    this.taxonExpertise$ = this.personService.personFindProfileByToken(this.userService.getToken()).pipe(
      switchMap(profile => {
        const taxonExpertise = profile.taxonExpertise || [];
        if (taxonExpertise.indexOf(taxonId) === -1) {
          taxonExpertise.push(taxonId);
        }
        profile.taxonExpertise = taxonExpertise;

        return this.personService.personUpdateProfileByToken(profile, this.userService.getToken()).pipe(
          map(() => (taxonExpertise))
        );
      }));
  }

  private onGetRecordingSuccess(data: IRecordingResponse) {
    this.loading = false;

    if (data.recording) {
      this.recording = data.recording;
      this.annotation = data.annotation || {};
      this.statusInfo = data.statusInfo;
      this.firstRecordingLoaded = true;
    } else {
      this.allRecordingsAnnotated = true;
    }

    this.cdr.markForCheck();
  }

  private handleError(err: any) {
    this.loading = false;

    const msg = KerttuApi.getErrorMessage(err);
    if (msg === KerttuErrorEnum.taxonExpertiseMissing) {
      this.taxonExpertiseMissing = true;
    } else if (msg === KerttuErrorEnum.invalidRecordingAnnotation) {
      alert(this.translate.instant('theme.kerttu.nextRecording.validation'));
    } else {
      this.hasError = true;
    }

    this.cdr.markForCheck();
  }
}
