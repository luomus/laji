import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {KerttuApi} from '../service/kerttu-api';
import {IRecording, IRecordingAnnotation, KerttuErrorEnum} from '../models';
import {UserService} from '../../../shared/service/user.service';
import {Observable} from 'rxjs';
import {KerttuTaxonService} from '../service/kerttu-taxon-service';
import {map, switchMap} from 'rxjs/operators';
import {PersonApi} from '../../../shared/api/PersonApi';

@Component({
  selector: 'laji-kerttu-recording-annotation',
  templateUrl: './kerttu-recording-annotation.component.html',
  styleUrls: ['./kerttu-recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuRecordingAnnotationComponent implements OnInit {
  recording: IRecording;
  annotation: IRecordingAnnotation;

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
    this.kerttuApi.getRecording(this.userService.getToken()).pipe(
      switchMap(recording => {
        return this.kerttuApi.getRecordingAnnotation(this.userService.getToken(), recording.id).pipe(map(annotation => {
          return {
            recording,
            annotation
          };
        }));
      })
    ).subscribe((result) => {
      this.recording = result.recording;
      this.annotation = result.annotation || {};
      this.cdr.markForCheck();
    });
    this.taxonList$ = this.taxonService.getTaxonList().pipe(
      map(taxons => taxons.map(taxon => taxon.id))
    );
    this.taxonExpertise$ = this.personService.personFindProfileByToken(this.userService.getToken()).pipe(map(profile => {
      return profile.taxonExpertise || [];
    }));
  }

  getNextRecording() {
    if (!this.recording || !this.annotation) {
      return;
    }

    this.saving = true;
    this.kerttuApi.setRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).pipe(
      switchMap(() => {
        return this.kerttuApi.getNextRecording(this.userService.getToken(), this.recording.id);
      })
    ).subscribe(recording => {
      this.recording = recording;
      this.annotation = {};
      this.saving = false;
      this.cdr.markForCheck();
    }, (error) => {
      if (KerttuApi.getErrorMessage(error) === KerttuErrorEnum.invalidRecordingAnnotation)  {
        alert('Kirjaa vähintään yksi lintu tai valitse ”Äänitteellä ei kuulu linnun ääniä” tai ”Äänitteellä kuuluu linnun ääniä, joita en tunnista”.');
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  save() {
    if (!this.recording || !this.annotation) {
      return;
    }

    this.saving = true;
    this.kerttuApi.setRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).subscribe(() => {
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

  onAnnotationChange() {

  }
}
