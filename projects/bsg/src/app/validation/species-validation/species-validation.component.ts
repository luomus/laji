import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs';
import {
  TemplateComment,
  ValidationAudioData,
  Species,
  Template,
  TemplateVersion,
  BsgErrorEnum
} from '../../bsg-shared/models';
import { BsgApi } from '../../bsg-shared/service/bsg-api';
import { DialogService } from 'projects/laji/src/app/shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { LocalizeRouterService } from 'projects/laji/src/app/locale/localize-router.service';
import { AudioService } from '../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { SpectrogramConfig } from '../../../../../laji/src/app/shared-modules/audio-viewer/models';
import { defaultSpectrogramConfig } from '../../../../../laji/src/app/shared-modules/audio-viewer/variables';
import { defaultAudioSampleRate } from '../../bsg-shared/variables';

@Component({
    selector: 'bsg-species-validation',
    templateUrl: './species-validation.component.html',
    styleUrls: ['./species-validation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SpeciesValidationComponent implements OnInit, OnDestroy {
  species$!: Observable<Species>;
  recordings$!: Observable<ValidationAudioData[]>;
  templateVersions$!: Observable<TemplateVersion[]>;
  activeTemplates$!: Observable<(Template|null)[]>;
  historyView$!: Observable<boolean>;

  saving = false;
  canLeaveWithoutConfirm = false;
  hasLock?: boolean;

  audioSampleRate = defaultAudioSampleRate;
  spectrogramConfig: SpectrogramConfig = defaultSpectrogramConfig;

  private activeVersionIdxSubject = new BehaviorSubject<number>(0);
  activeVersionIdx$ = this.activeVersionIdxSubject.asObservable();

  private speciesId$!: Observable<number>;
  private speciesId?: number;

  private hasLockSub!: Subscription;

  constructor(
    private userService: UserService,
    private translate: TranslateService,
    private bsgApi: BsgApi,
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
      switchMap(speciesId => this.bsgApi.lockSpecies(
        this.userService.getToken(), speciesId
      ))
    ).subscribe(result => {
      this.hasLock = result.success;
      this.cd.markForCheck();
    });
    this.species$ = this.speciesId$.pipe(
      switchMap(speciesId => this.bsgApi.getSpecies(this.translate.getCurrentLang(), speciesId))
    );
    this.recordings$ = this.speciesId$.pipe(
      switchMap(speciesId => this.bsgApi.getValidationRecordings(this.translate.getCurrentLang(), speciesId).pipe(
        map(data => data.results),
        tap(recordings => {
          this.audioService.setBufferCacheSize(recordings.length);
        })
      ))
    );
    this.templateVersions$ = this.speciesId$.pipe(
      switchMap(speciesId => this.bsgApi.getTemplateVersions(speciesId).pipe(
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
  @HostListener('window:onunload')
  onUnload() {
    this.unlockSpecies();
  }

  canDeactivate() {
    if (!this.canLeaveWithoutConfirm) {
      return this.dialogService.confirm(this.translate.instant('validation.leaveConfirm'));
    }
    return true;
  }

  saveTemplates(data: { templates: (Template|null)[]; comments: TemplateComment[] }) {
    this.saving = true;
    this.bsgApi.saveTemplates(this.userService.getToken(), this.speciesId!, data).subscribe(() => {
      this.saving = false;
      this.canLeaveWithoutConfirm = true;
      this.goToSpeciesList();
      this.cd.markForCheck();
    }, (e) => {
      this.saving = false;
      const message = BsgApi.getErrorMessage(e);
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
      this.bsgApi.unlockSpecies(this.userService.getToken(), this.speciesId);
    }
  }

  private showErrorMessage(message: BsgErrorEnum) {
    let reason: string | undefined;
    if (message === BsgErrorEnum.speciesLocked) {
      reason = this.translate.instant('validation.savingError.speciesLocked');
    }

    this.dialogService.alert(
      this.translate.instant('validation.savingError') + (
        reason ? ' ' + reason : ''
      )
    );
  }
}
