import { Form } from '../shared/model/Form';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap, startWith, switchMap, take } from 'rxjs/operators';
import { combineLatest, merge, Observable, of, Subscription, Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { UserService } from '../shared/service/user.service'; import { Document } from '../shared/model/Document';
import { DocumentViewerFacade } from '../shared-modules/document-viewer/document-viewer.facade';
import { ProjectForm, ProjectFormService } from '../shared/service/project-form.service';
import { FormPermissionService, Rights } from '../shared/service/form-permission.service';
import { FormPermission } from '../shared/model/FormPermission';
import { BrowserService } from '../shared/service/browser.service';
import { Title } from '@angular/platform-browser';
import { TriplestoreLabelService } from '../shared/service/triplestore-label.service';
import { Breadcrumb } from '../shared-modules/breadcrumb/theme-breadcrumb/theme-breadcrumb.component';
import ResultServiceType = Form.ResultServiceType;
import { formOptionToClassName } from '../shared/directive/project-form-option.directive';

interface ViewModel {
  navLinks: NavLink[];
  form: Form.SchemaForm;
  formIDs: string[];
  disabled: boolean;
  datasetsBreadcrumb?: Breadcrumb[];
}

function isViewModel(vm: ViewModel | NotFoundViewModel): vm is ViewModel {
  return !!(vm as any).form;
}

interface NotFoundViewModel {
  formID: string;
}

function isNotFoundViewModel(vm: ViewModel | NotFoundViewModel): vm is NotFoundViewModel {
  return !!(vm as any).formID;
}

interface NavLink {
  link: string[];
  label: string;
  linkParams?: Params;
  children?: NavLink[];
  content?: BadgeTemplate;
  active?: boolean;
  lajiFormOption?: string;
}

interface BadgeTemplate {
  template: 'badge';
  count: 'permissionRequests' | 'editors' | 'admins';
}

@Component({
  templateUrl: `./project-form.component.html`,
  styleUrls: ['./project-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private documentViewerFacade: DocumentViewerFacade,
    private projectFormService: ProjectFormService,
    private formPermissionService: FormPermissionService,
    public userService: UserService,
    private router: Router,
    private browserService: BrowserService,
    private title: Title,
    private labelService: TriplestoreLabelService,
) {}

  vm$: Observable<ViewModel | NotFoundViewModel>;
  formPermissions$: Observable<FormPermission>;
  showNav$: Observable<boolean>;
  isPrintPage$: Observable<boolean>;
  redirectionSubscription: Subscription;
  userToggledSidebar$: Subject<boolean> = new BehaviorSubject<boolean>(undefined);

  isViewModel = isViewModel;
  isNotFoundViewModel = isNotFoundViewModel;

  formOptionToClassName = formOptionToClassName;

  private titleSubscription: Subscription;

  private static getResultServiceRoutes(resultServiceType: ResultServiceType, queryParams: Params): NavLink[] {
    switch (resultServiceType) {
      case ResultServiceType.winterbirdCount:
        return [
          {
            link: ['stats'],
            label: 'wbc.stats.species',
            linkParams: {tab: 'species'},
            active: queryParams['tab'] === 'species'
          },
          {
            link: ['stats'],
            label: 'wbc.stats.routes',
            linkParams: {tab: 'routes'},
            active: queryParams['tab'] === 'routes'
          },
          {
            link: ['stats'],
            label: 'wbc.stats.censuses',
            linkParams: {tab: 'censuses'},
            active: queryParams['tab'] === 'censuses'
          }
        ];
      case ResultServiceType.sykeInsect:
        return [
          {
            link: ['stats'],
            label: 'sykeInsect.stats.allResults',
            linkParams: {tab: 'species'},
            active: queryParams['tab'] === 'species'
          },
          {
            link: ['stats'],
            label: 'sykeInsect.stats.routes',
            linkParams: {tab: 'routes'},
            active: queryParams['tab'] === 'routes'
          }
        ];
      default:
        return [];
    }
  }

  private static getFormRoutes(form: Form.SchemaForm, subForms: Form.List[], rights: Rights) {
    if (form.options?.secondaryCopy) {
     return [];
    }
    const _subForms = subForms.filter(_form => _form.options?.sidebarFormLabel);
    return [form, ..._subForms].filter(_form =>
      _form.options?.useNamedPlaces && rights.view
      || !_form.options?.useNamedPlaces && rights.edit
    ).map(_form => ({
      link:  [`form${(_form === form && !_subForms.length) ? '' : `/${_form.id}`}`],
      label: _form.options?.sidebarFormLabel || 'nafi.form',
      lajiFormOption: 'options.sidebarFormLabel'
    }));
  }

  ngOnInit(): void {
    const _projectForm$ = this.projectFormService.getProjectFormFromRoute$(this.route);
    const notFound$ = _projectForm$.pipe(
      map(projectForm => !projectForm.form)
    );

    const projectForm$ = _projectForm$.pipe(filter( projectForm => !!projectForm.form));

    const rights$ = projectForm$.pipe(switchMap(projectForm => this.formPermissionService.getRights(projectForm.form)));

    const formID$ = this.projectFormService.getFormID(this.route);

    this.vm$ = notFound$.pipe(
      switchMap(notFound => notFound
        ? formID$.pipe(map(formID => ({formID})))
        : combineLatest([projectForm$, rights$, this.route.queryParams]).pipe(
          map(([projectForm, rights, queryParams]) => ({
              form: projectForm.form,
              formIDs: [projectForm.form.id, ...projectForm.subForms.map(subForm => subForm.id)],
              navLinks: (!projectForm.form.options?.simple && !projectForm.form.options?.mobile)
                ? this.getNavLinks(projectForm, rights, queryParams)
                : undefined,
              disabled: projectForm.form.options?.disabled && !rights?.ictAdmin,
              datasetsBreadcrumb: this.getDatasetsBreadcrumb(projectForm.form)
            })
          )
        )
      )
    );

    const form$ = this.projectFormService.getFormFromRoute$(this.route);
    const initialFp$ = form$.pipe(
      switchMap(form => this.formPermissionService.getFormPermission(form.collectionID, this.userService.getToken())),
      take(1)
    );

    this.formPermissions$ = this.userService.isLoggedIn$.pipe(
      switchMap(isLoggedIn => isLoggedIn
        ? merge(initialFp$, this.formPermissionService.changes$)
        : of(null)
      )
    );

    const routerEvents$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
      startWith(this.router.url)
    );

    this.showNav$ = combineLatest([routerEvents$, this.userToggledSidebar$.asObservable()]).pipe(
      mergeMap(([url, userToggledSidebar]) =>
        form$.pipe(
          map(form =>
            userToggledSidebar !== false
            && !(
              (!form.options?.useNamedPlaces && url.match(/\/form$/))
              || (form.options?.useNamedPlaces && url.match(/\/places\/MNP\.\d+$/))
              || (url.match(/\/form\/(.*\/)?((JX\.)|(T:))\d+$/))
            )
          )
        )
      )
    );

    this.isPrintPage$ = routerEvents$.pipe(map(url => !!url.match(/\/print$/)));

    this.redirectionSubscription = combineLatest([routerEvents$, projectForm$]).subscribe(([, projectForm]) => {
      if (!this.route.children.length) {
        const mainPage = projectForm.form.options?.simple
          ? 'form'
          : 'about';
        this.router.navigate([`./${mainPage}`], {relativeTo: this.route, replaceUrl: true});
      }
    });

    this.titleSubscription = combineLatest([routerEvents$, projectForm$]).pipe(
      switchMap(([, projectForm]) => this.getFormTitle(projectForm.form))
    ).subscribe((title) => {
      if (title) {
        this.title.setTitle(title + ' | ' + this.title.getTitle());
      }
    });
  }

  ngOnDestroy(): void {
    this.redirectionSubscription.unsubscribe();
    this.titleSubscription.unsubscribe();
  }

  private getNavLinks(projectForm: ProjectForm, rights: Rights, queryParams: Params): NavLink[] {
    const allowExcel = this.projectFormService.getExcelFormIDs(projectForm).length;
    const {form, subForms} = projectForm;
    return [
      {
        link: ['about'],
        label: 'about'
      },
      rights.edit && form.options?.instructions && {
        link: ['instructions'],
        label: 'instructions',
        lajiFormOption: 'options.instructions'
      },
      form.options?.resultServiceType && {
        link: ['stats'],
        label: 'nafi.stats',
        children: ProjectFormComponent.getResultServiceRoutes(form.options?.resultServiceType, queryParams),
        lajiFormOption: 'options.resultServiceType'
      },
      ...ProjectFormComponent.getFormRoutes(form, subForms, rights),
      rights.edit && allowExcel && {
        link: ['import'],
        label: 'excel.import',
        lajiFormOption: 'options.allowExcel'
      },
      rights.edit && allowExcel && {
        link: ['generate'],
        label: 'excel.generate',
        lajiFormOption: 'options.allowExcel'
      },
      rights.edit && !form.options?.secondaryCopy && {
        link: ['submissions'],
        label: this.projectFormService.getSubmissionsPageTitle(form, rights.admin),
        lajiFormOption: 'options.secondaryCopy'
      },
      rights.edit && form.options?.allowTemplate && {
        link: ['templates'],
        label: 'haseka.templates.title',
        lajiFormOption: 'options.allowTemplate'
      },
      (rights.admin || rights.ictAdmin) && form.options?.hasAdmins && {
        link: ['admin'],
        label: 'form.administer',
        children: [
          {
            link: ['admin', 'instructions'],
            label: 'form.permission.nav.instuctions',
          },
          {
            link: ['admin', 'accept'],
            label: 'form.permission.nav.requests',
            content: {
              template: 'badge',
              count: 'permissionRequests'
            } as BadgeTemplate
          },
          {
            link: ['admin', 'manage', 'editors'],
            label: 'form.permission.nav.accepted',
            content: {
              template: 'badge',
              count: 'editors'
            } as BadgeTemplate
          },
          {
            link: ['admin', 'manage', 'admins'],
            label: 'form.permission.nav.admins',
            content: {
              template: 'badge',
              count: 'admins'
            } as BadgeTemplate
          },
          {
            link: ['admin', 'participants'],
            label: 'form.permission.nav.participants'
          },
        ],
        lajiFormOption: 'options.hasAdmins'
      }
    ].filter(n => n);
  }

  private getDatasetsBreadcrumb(form: Form.SchemaForm): Breadcrumb[] {
    if (!form.options?.dataset) {
      return [];
    }

    return [
      {
        link: '/theme',
        label: 'navigation.theme'
      },
      {
        link: '/theme/datasets',
        label: 'datasets.label'
      },
      {
        link: '.',
        label: form.collectionID,
        isLabel: true
      }
    ];
  }

  showDocumentViewer(document: Document) {
    this.documentViewerFacade.showDocument({document, own: true});
  }

  trackByLabel(index, link) {
    return link.label;
  }

  navBarToggled(event) {
    this.userToggledSidebar$.next(event);
  }

  clickedSidebarLink() {
    // Close the sidebar on sidebar navigation on mobile.
    this.browserService.lgScreen$.pipe(take(1)).subscribe(isDesktopScreen =>
      !isDesktopScreen && this.userToggledSidebar$.next(false)
    );
  }

  private getFormTitle(form: Form.SchemaForm): Observable<string> {
    let title$ = of(form.title);

    if (form.options?.dataset) {
      title$ = forkJoin([
        this.labelService.get(form.collectionID, this.translate.currentLang),
        this.translate.get('datasets.label')
      ]).pipe(
        map((result: string[]) => result.filter(res => !!res).join(' | '))
      );
    }

    return title$;
  }
}
