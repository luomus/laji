import { Component, ChangeDetectionStrategy, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { IKerttuLetterTemplate, IKerttuRecording } from '../../kerttu-global-shared/models';
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
  species$: Observable<number>;
  validationData$: Observable<IKerttuRecording[]>;
  templates$: Observable<IKerttuLetterTemplate[]>;
  saving = false;

  private species: number;

  constructor(
    private userService: UserService,
    private translate: TranslateService,
    private kerttuApi: KerttuGlobalApi,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.species$ = this.route.params.pipe(
      map(param => parseInt(param['id'], 10)),
      tap(species => {
        this.species = species;
      })
    );
    this.validationData$ = this.species$.pipe(
      switchMap(species => this.kerttuApi.getDataForValidation(species).pipe(map(data => data.results)))
    );
    this.templates$ = this.species$.pipe(
      switchMap(species => this.kerttuApi.getTemplates(species).pipe(
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
    $event.returnValue = false;
  }

  canDeactivate() {
    return this.dialogService.confirm(this.translate.instant('validation.leaveConfirm'));
  }


  saveTemplates(templates: IKerttuLetterTemplate[]) {
    const missingTemplates = templates.indexOf(null) !== -1;
    if (missingTemplates) {
      this.dialogService.alert(
        this.translate.instant('validation.missingTemplates')
      );
      return;
    }

    this.saving = true;
    this.kerttuApi.saveTemplates(this.userService.getToken(), this.species, templates).subscribe(() => {
      this.saving = false;
      this.router.navigate(this.localizeRouterService.translateRoute(['validation']));
      this.cd.markForCheck();
    });
  }
}
