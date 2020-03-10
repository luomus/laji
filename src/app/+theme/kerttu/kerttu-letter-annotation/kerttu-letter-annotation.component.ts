import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {KerttuApi} from '../kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import {Observable} from 'rxjs';
import {IRecordingWithCandidates} from '../model/recording';
import {switchMap, take} from 'rxjs/operators';
import {PersonApi} from '../../../shared/api/PersonApi';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss']
})
export class KerttuLetterAnnotationComponent implements OnInit {
  letterCandidates$: Observable<IRecordingWithCandidates>;

  currentCandidate = 0;
  currentAnnotation: number = undefined;

  constructor(
    private kerttuApi: KerttuApi,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private personService: PersonApi
  ) { }

  ngOnInit() {
    this.userService.isLoggedIn$.pipe(take(1)).subscribe(() => {
      this.letterCandidates$ = this.personService.personFindProfileByToken(this.userService.getToken()).pipe(
        switchMap(profile => {
          return this.kerttuApi.getLetterCandidates(this.userService.getToken());
        })
      );
    });
  }

  onAnnotationChange() {
    this.currentCandidate++;
  }

  onCandidateChange(idx: string) {
    this.currentCandidate = parseInt(idx, 10);
  }
}
