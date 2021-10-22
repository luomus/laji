import { Component, ChangeDetectionStrategy, OnInit, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, Subscription } from 'rxjs';
import { map, switchMap, tap, share } from 'rxjs/operators';
import { IGlobalTemplate, IGlobalRecording, IGlobalSpecies, IGlobalComment, IGlobalValidationData } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { DialogService } from 'projects/laji/src/app/shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { LocalizeRouterService } from 'projects/laji/src/app/locale/localize-router.service';

@Component({
  selector: 'laji-species-validation',
  templateUrl: './species-validation.component.html',
  styleUrls: ['./species-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesValidationComponent implements OnInit, OnDestroy {
  species$: Observable<IGlobalSpecies>;
  validationData$: Observable<IGlobalRecording[]>;
  data$: Observable<IGlobalValidationData[]>;
  templates$: Observable<IGlobalTemplate[]>;
  historyView$: Observable<boolean>;

  saving = false;
  canLeaveWithoutConfirm = false;
  hasLock: boolean;

  private activeIdxSubject = new BehaviorSubject<number>(undefined);
  activeIdx$ = this.activeIdxSubject.asObservable();

  private speciesId$: Observable<number>;
  private speciesId: number;

  private hasLockSub: Subscription;

  constructor(
    private userService: UserService,
    private translate: TranslateService,
    private kerttuGlobalApi: KerttuGlobalApi,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.speciesId$ = this.route.params.pipe(
      map(param => parseInt(param['id'], 10)),
      tap(speciesId => {
        this.speciesId = speciesId;
      })
    );
    this.hasLockSub = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.lockSpecies(
        this.userService.getToken(), speciesId
      ))
    ).subscribe(result => {
      this.hasLock = result.success;
      this.cd.markForCheck();
    });
    this.species$ = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.getSpecies(speciesId))
    );
    this.validationData$ = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.getDataForValidation(speciesId).pipe(map(data => data.results)))
    );
    this.data$ = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.getTemplates(speciesId).pipe(
        map(data => data.results),
        tap(data => {
          if (data.length > 0) {
            this.activeIdxChange(data.length - 1);
          }
        })
      )),
      share()
    );
    this.templates$ = combineLatest([this.data$, this.activeIdx$]).pipe(
      map(([data, activeIdx]) => {
        if (data.length > 0) {
          return data[activeIdx].templates;
        }
        const templates = [];
        while (templates.length < 10) {
          templates.push(null);
        }
        return templates;
      })
    );
    this.historyView$ = combineLatest([this.data$, this.activeIdx$]).pipe(
      map(([data, activeIdx]) => {
        if (data.length === 0) {
          return false;
        }
        return activeIdx !== data.length - 1;
      })
    );
  }

  ngOnDestroy() {
    if (this.hasLockSub) {
      this.hasLockSub.unsubscribe();
    }
    this.unlockSpecies();
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    $event.returnValue = this.canLeaveWithoutConfirm;
  }

  @HostListener('window:onunload', ['$event'])
  onUnload() {
    // Unlock species on page close
    this.unlockSpecies();
  }

  canDeactivate() {
    if (!this.canLeaveWithoutConfirm) {
      return this.dialogService.confirm(this.translate.instant('validation.leaveConfirm'));
    }
    return true;
  }

  saveTemplates(data: {templates: IGlobalTemplate[], comments: IGlobalComment[]}) {
    this.saving = true;
    this.kerttuGlobalApi.saveTemplates(this.userService.getToken(), this.speciesId, data).subscribe(() => {
      this.saving = false;
      this.canLeaveWithoutConfirm = true;
      this.router.navigate(this.localizeRouterService.translateRoute(['validation']));
      this.cd.markForCheck();
    }, () => {
      this.saving = false;
      this.cd.markForCheck();
    });
  }

  cancel() {
    this.router.navigate(this.localizeRouterService.translateRoute(['validation']));
  }

  activeIdxChange(activeIdx: number) {
    this.activeIdxSubject.next(activeIdx);
  }

  private unlockSpecies() {
    if (this.speciesId && this.hasLock !== false) {
      this.kerttuGlobalApi.unlockSpecies(this.userService.getToken(), this.speciesId);
    }
  }
}
