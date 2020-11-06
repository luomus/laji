import { ChangeDetectionStrategy, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, of, Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { BrowserService } from '../../../shared/service/browser.service';
import { Form } from '../../../shared/model/Form';
import { NamedPlacesService } from '../../../shared/service/named-places.service';
import { LajiFormDocumentFacade } from '../../../shared-modules/laji-form/laji-form-document.facade';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { DocumentFormComponent as _DocumentFormComponent } from '../../../shared-modules/laji-form/document-form/document-form.component';

@Component({
  template: `
    <laji-document-form
      [formId]="form.id"
      [documentId]="documentID"
      [showHeader]="!form.options?.mobile"
      [showShortcutButton]="!form.options?.mobile"
      (missingNamedplace)="goBack()"
      (success)="onSuccess()"
      (error)="goBack()"
      (cancel)="goBack()"
    >
    </laji-document-form>
  `,
  selector: 'laji-project-form-document-form',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent implements OnDestroy {
  @Input() form: Form.SchemaForm;
  @Input() documentID: string;

  npLoaded$ = new BehaviorSubject<boolean>(false);
  npSubscription: Subscription;

  @ViewChild(_DocumentFormComponent) documentComponent: _DocumentFormComponent;

  @Input() set namedPlace(namedPlace: NamedPlace) {
    if (namedPlace) {
      this.lajiFormDocumentFacade.useNamedPlace(namedPlace, this.form.id);
    }
    this.npLoaded$.next(true);
  }

  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private browserService: BrowserService,
    private route: ActivatedRoute,
    private namedPlacesService: NamedPlacesService,
    private lajiFormDocumentFacade: LajiFormDocumentFacade
  ) {}

  ngOnDestroy(): void {
    this.npSubscription?.unsubscribe();
  }

  goBack() {
    let levels = 1;
    if (this.documentID) {
      levels++;
    }
    this.browserService.goBack(() => {
      this.router.navigate(
        [new Array(levels).fill('..').join('/')],
        {relativeTo: this.route.parent, replaceUrl: true}
      );
    });
  }

  onSuccess() {
    const findProjectRootRoute = (route) => route.params.pipe(switchMap(params => {
      if (params['projectID']) {
        return of(route);
      } else {
        return findProjectRootRoute(route.parent);
      }
    }));

    this.browserService.goBack(() => {
      findProjectRootRoute(this.route).pipe(take(1)).subscribe(projectRoute => {
        const page = this.form.options?.resultServiceType
          ? 'stats'
          : this.form.options?.mobile
            ? 'about'
            : 'submissions';
        this.router.navigate([`./${page}`], {relativeTo: projectRoute});
      });
    });
  }

  canDeactivate(...params) {
    return this.documentComponent
      ? this.documentComponent.canDeactivate(...params)
      : true;
  }
}
