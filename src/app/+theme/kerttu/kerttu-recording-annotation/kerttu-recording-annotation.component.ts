import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
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

  constructor(
    private kerttuApi: KerttuApi,
    private taxonService: KerttuTaxonService,
    private userService: UserService
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
  }

  getNextRecording() {
    this.recording$ = this.kerttuApi.getRecording(this.userService.getToken()).pipe(
      tap(recording => {
        this.recordingAnnotation$ = this.kerttuApi.getRecordingAnnotation(this.userService.getToken(), recording.id);
      })
    );
  }

  save(data: {recordingId: number, annotation: IRecordingAnnotation}) {
    this.kerttuApi.setRecordingAnnotation(this.userService.getToken(), data.recordingId, data.annotation).subscribe();
  }
}
