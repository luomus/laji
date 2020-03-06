import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {KerttuApi} from '../kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import {Observable} from 'rxjs';
import {IRecordingWithCandidates} from '../model/recording';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss']
})
export class KerttuLetterAnnotationComponent implements OnInit {
  letterCandidates$: Observable<IRecordingWithCandidates>;

  constructor(
    private kerttuApi: KerttuApi,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.letterCandidates$ = this.kerttuApi.getLetterCandidates(this.userService.getToken());
  }

}
