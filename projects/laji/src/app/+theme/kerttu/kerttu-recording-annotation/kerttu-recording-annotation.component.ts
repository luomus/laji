import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {KerttuApi} from '../service/kerttu-api';
import {IRecording, IRecordingAnnotation} from '../models';
import {UserService} from '../../../shared/service/user.service';
import {Observable} from 'rxjs';
import {KerttuTaxonService} from '../service/kerttu-taxon-service';
import {map, switchMap, tap} from 'rxjs/operators';
import {PersonApi} from '../../../shared/api/PersonApi';

@Component({
  selector: 'laji-kerttu-recording-annotation',
  templateUrl: './kerttu-recording-annotation.component.html',
  styleUrls: ['./kerttu-recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuRecordingAnnotationComponent implements OnInit {
  recording$: Observable<IRecording>;
  recordingAnnotation$: Observable<IRecordingAnnotation>;
  taxonList$: Observable<string[]>;
  taxonExpertise$: Observable<string[]>;

  saving = false;

  constructor(
    private kerttuApi: KerttuApi,
    private taxonService: KerttuTaxonService,
    private userService: UserService,
    private personService: PersonApi,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.recording$ = this.kerttuApi.getRecording(this.userService.getToken()).pipe(
      tap(recording => {
        this.recordingAnnotation$ = this.kerttuApi.getRecordingAnnotation(this.userService.getToken(), recording.id);
      })
    );
    this.taxonList$ = this.taxonService.getTaxonList().pipe(
      map(taxons => taxons.map(taxon => taxon.id))
    );
    this.taxonExpertise$ = this.personService.personFindProfileByToken(this.userService.getToken()).pipe(map(profile => {
      return profile.taxonExpertise || [];
    }));
  }

  getNextRecording() {
    this.recordingAnnotation$ = undefined;
    this.recording$ = this.kerttuApi.getNextRecording(this.userService.getToken());
  }

  save(data: {recordingId: number, annotation: IRecordingAnnotation}) {
    this.saving = true;
    this.kerttuApi.setRecordingAnnotation(this.userService.getToken(), data.recordingId, data.annotation).subscribe(() => {
      this.saving = false;
      this.cdr.markForCheck();
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
}
