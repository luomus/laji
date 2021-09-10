import { Component, ChangeDetectionStrategy, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { IGlobalTemplate, IGlobalRecording, IGlobalSpecies } from '../../kerttu-global-shared/models';
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
export class SpeciesValidationComponent implements OnInit {
  species$: Observable<IGlobalSpecies>;
  validationData$: Observable<IGlobalRecording[]>;
  templates$: Observable<IGlobalTemplate[]>;
  saving = false;
  canLeaveWithoutConfirm = false;

  private speciesId$: Observable<number>;
  private speciesId: number;

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
    this.species$ = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.getSpecies(speciesId))
    );
    this.validationData$ = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.getDataForValidation(speciesId).pipe(map(data => data.results)))
    );
    this.templates$ = this.speciesId$.pipe(
      switchMap(speciesId => this.kerttuGlobalApi.getTemplates(speciesId).pipe(
        map(data => data.results),
        map(data => {
          while (data.length < 10) {
            data.push(null);
          }
          return data;
        })
      ))
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    $event.returnValue = this.canLeaveWithoutConfirm;
  }

  canDeactivate() {
    if (!this.canLeaveWithoutConfirm) {
      return this.dialogService.confirm(this.translate.instant('validation.leaveConfirm'));
    }
    return true;
  }


  saveTemplates(templates: IGlobalTemplate[]) {
    this.saving = true;
    this.kerttuGlobalApi.saveTemplates(this.userService.getToken(), this.speciesId, templates).subscribe(() => {
      this.saving = false;
      this.canLeaveWithoutConfirm = true;
      this.router.navigate(this.localizeRouterService.translateRoute(['validation']));
      this.cd.markForCheck();
    });
  }

  cancel() {
    this.router.navigate(this.localizeRouterService.translateRoute(['validation']));
  }
}
