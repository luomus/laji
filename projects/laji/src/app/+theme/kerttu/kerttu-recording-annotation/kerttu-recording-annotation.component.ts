import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {KerttuApi} from '../service/kerttu-api';
import {IRecording} from '../models';
import {UserService} from '../../../shared/service/user.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'laji-kerttu-recording-annotation',
  templateUrl: './kerttu-recording-annotation.component.html',
  styleUrls: ['./kerttu-recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuRecordingAnnotationComponent implements OnInit {
  recording$: Observable<IRecording>;

  constructor(
    private kerttuApi: KerttuApi,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.recording$ = this.kerttuApi.getRecording(this.userService.getToken());
  }

}
