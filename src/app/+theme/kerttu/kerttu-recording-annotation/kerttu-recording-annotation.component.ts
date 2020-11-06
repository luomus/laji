import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {KerttuApi} from '../service/kerttu-api';
import {IRecording, IRecordingAnnotation} from '../models';
import {UserService} from '../../../shared/service/user.service';
import {Observable} from 'rxjs';
import {KerttuTaxonService} from '../service/kerttu-taxon-service';
import {map, tap} from 'rxjs/operators';

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

  saving = false;
  loadingAnnotation = false;

  constructor(
    private kerttuApi: KerttuApi,
    private taxonService: KerttuTaxonService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.recording$ = this.kerttuApi.getRecording(this.userService.getToken()).pipe(
      tap(recording => {
        this.loadingAnnotation = true;
        this.recordingAnnotation$ = this.kerttuApi.getRecordingAnnotation(this.userService.getToken(), recording.id).pipe(
          tap(() => {
            this.loadingAnnotation = false;
          })
        );
      })
    );
    this.taxonList$ = this.taxonService.getTaxonList().pipe(
      map(taxons => taxons.map(taxon => taxon.id))
    );
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
}
