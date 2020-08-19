import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {debounceTime, map, switchMap, tap} from 'rxjs/operators';
import {UserService} from '../../../shared/service/user.service';
import {PersonApi} from '../../../shared/api/PersonApi';
import {Profile} from '../../../shared/model/Profile';
import {ComponentCanDeactivate} from '../../../shared/guards/document-de-activate.guard';

@Component({
  selector: 'laji-kerttu-expertise-form',
  templateUrl: './kerttu-expertise-form.component.html',
  styleUrls: ['./kerttu-expertise-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuExpertiseFormComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  selectedTaxonIds: string[];
  savedSelectedTaxonIds: string[];

  private selectedTaxonIdsSub: Subscription;
  private selectedTaxonIdsChanged: Subject<string[]> = new Subject<string[]>();
  private saveProfileSub: Subscription;

  private profile: Profile;

  private debounceTime = 1000;

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private personService: PersonApi,
  ) { }

  ngOnInit() {
    this.selectedTaxonIdsSub = this.personService.personFindProfileByToken(this.userService.getToken()).subscribe((profile) => {
      this.profile = profile;
      this.selectedTaxonIds = profile.taxonExpertise || [];
      this.savedSelectedTaxonIds = this.selectedTaxonIds;
      this.cdr.markForCheck();
    });

    this.saveProfileSub = this.selectedTaxonIdsChanged
      .pipe(
        debounceTime(this.debounceTime),
        switchMap(() => {
          return this.updateTaxonExpertice(this.selectedTaxonIds);
        })
      ).subscribe(() => {
          this.cdr.markForCheck();
        }
      );
  }

  ngOnDestroy() {
    if (this.selectedTaxonIdsSub) {
      this.selectedTaxonIdsSub.unsubscribe();
    }
    if (this.saveProfileSub) {
      this.saveProfileSub.unsubscribe();
    }
  }

  onSelectedTaxonIdsChange(selectedTaxonIds: string[]) {
    this.selectedTaxonIds = selectedTaxonIds;
    this.selectedTaxonIdsChanged.next(this.selectedTaxonIds);
  }

  canDeactivate() {
    if (this.saveProfileSub) {
      this.saveProfileSub.unsubscribe();
    }
    return this.updateTaxonExpertice(this.selectedTaxonIds)
      .pipe(map(() => true));
  }

  private updateTaxonExpertice(selectedTaxonIds): Observable<Profile> {
    if (this.savedSelectedTaxonIds === selectedTaxonIds) {
      return of (this.profile);
    }

    this.profile.taxonExpertise = selectedTaxonIds;
    return this.personService.personUpdateProfileByToken(this.profile, this.userService.getToken()).pipe(
      tap(() => {
        this.savedSelectedTaxonIds = selectedTaxonIds;
      })
    );
  }
}
