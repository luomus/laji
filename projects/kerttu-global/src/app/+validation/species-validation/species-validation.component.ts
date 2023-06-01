import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import {
  IGlobalComment,
  IGlobalRecording,
  IGlobalSpecies,
  IGlobalTemplate,
  IGlobalTemplateVersion,
  KerttuGlobalErrorEnum
} from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { DialogService } from 'projects/laji/src/app/shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { LocalizeRouterService } from 'projects/laji/src/app/locale/localize-router.service';
import { AudioService } from '../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { ISpectrogramConfig } from '../../../../../laji/src/app/shared-modules/audio-viewer/models';
import { defaultSpectrogramConfig } from '../../../../../laji/src/app/shared-modules/audio-viewer/variables';
import { defaultAudioSampleRate } from '../../kerttu-global-shared/variables';

@Component({
  selector: 'bsg-species-validation',
  templateUrl: './species-validation.component.html',
  styleUrls: ['./species-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesValidationComponent implements OnInit, OnDestroy {
  species$: Observable<IGlobalSpecies>;
  recordings$: Observable<IGlobalRecording[]>;
  templateVersions$: Observable<IGlobalTemplateVersion[]>;
  activeTemplates$: Observable<IGlobalTemplate[]>;
  historyView$: Observable<boolean>;

  saving = false;
  canLeaveWithoutConfirm = false;
  hasLock?: boolean;

  audioSampleRate = defaultAudioSampleRate;
  spectrogramConfig: ISpectrogramConfig = {
    ...defaultSpectrogramConfig,
    sampleRate: this.audioSampleRate
  };

  private activeVersionIdxSubject = new BehaviorSubject<number>(0);
  activeVersionIdx$ = this.activeVersionIdxSubject.asObservable();

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
    private audioService: AudioService,
    private cd: ChangeDetectorRef
  ) {}

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
      switchMap(speciesId => this.kerttuGlobalApi.getSpecies(this.translate.currentLang, speciesId))
    );
    this.recordings$ = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.getRecordings(this.translate.currentLang, speciesId).pipe(
        map(data => data.results),
        tap(recordings => {
          this.audioService.setCacheSize(recordings.length);
        })
      ))
    );
    this.templateVersions$ = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.getTemplateVersions(speciesId).pipe(
        map(data => data.results),
        tap(versions => {
          if (versions.length > 0) {
            this.activeVersionIdxChange(versions.length - 1);
          }
        })
      )),
      share()
    );
    this.activeTemplates$ = combineLatest([this.templateVersions$, this.activeVersionIdx$]).pipe(
      map(([versions, activeIdx]) => {
        if (versions.length > 0) {
          return versions[activeIdx].templates;
        }
        const templates = [];
        while (templates.length < 10) {
          templates.push(null);
        }
        return templates;
      })
    );
    this.historyView$ = combineLatest([this.templateVersions$, this.activeVersionIdx$]).pipe(
      map(([versions, activeIdx]) => {
        if (versions.length === 0) {
          return false;
        }
        return activeIdx !== versions.length - 1;
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

  // Unlock species on page close
  @HostListener('window:onunload', ['$event'])
  onUnload() {
    this.unlockSpecies();
  }

  canDeactivate() {
    if (!this.canLeaveWithoutConfirm) {
      return this.dialogService.confirm(this.translate.instant('validation.leaveConfirm'));
    }
    return true;
  }

  saveTemplates(data: { templates: IGlobalTemplate[]; comments: IGlobalComment[] }) {
    this.saving = true;
    this.kerttuGlobalApi.saveTemplates(this.userService.getToken(), this.speciesId, data).subscribe(() => {
      this.saving = false;
      this.canLeaveWithoutConfirm = true;
      this.goToSpeciesList();
      this.cd.markForCheck();
    }, (e) => {
      this.saving = false;
      const message = KerttuGlobalApi.getErrorMessage(e);
      this.showErrorMessage(message);
      this.cd.markForCheck();
    });
  }

  goToSpeciesList() {
    this.router.navigate(this.localizeRouterService.translateRoute(['validation/species']));
  }

  activeVersionIdxChange(activeIdx: number) {
    this.activeVersionIdxSubject.next(activeIdx);
  }

  private unlockSpecies() {
    if (this.speciesId && this.hasLock !== false) {
      this.kerttuGlobalApi.unlockSpecies(this.userService.getToken(), this.speciesId);
    }
  }

  private showErrorMessage(message: KerttuGlobalErrorEnum) {
    let reason: string;
    if (message === KerttuGlobalErrorEnum.speciesLocked) {
      reason = this.translate.instant('validation.savingError.speciesLocked');
    }

    this.dialogService.alert(
      this.translate.instant('validation.savingError') + (
        reason ? ' ' + reason : ''
      )
    );
  }
}
