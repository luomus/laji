import { Form } from '../shared/model/Form';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { FormService } from '../shared/service/form.service';
import { filter, map, mergeMap, startWith, switchMap, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, merge, Observable, of } from 'rxjs';
import { UserService } from '../shared/service/user.service'; import { Document } from '../shared/model/Document';
import { DocumentViewerFacade } from '../shared-modules/document-viewer/document-viewer.facade';
import { ProjectForm, ProjectFormService } from './project-form.service';
import { FormPermissionService, Rights } from '../shared/service/form-permission.service';
import { FormPermission } from '../shared/model/FormPermission';
import ResultServiceType = Form.ResultServiceType;

interface ViewModel {
  navLinks: NavLink[];
  form: Form.SchemaForm;
}

interface NavLink {
  link: string[];
  label: string;
  linkParams?: Params;
  children?: NavLink[];
  content?: BadgeTemplate;
  active?: boolean;
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
export class ProjectFormComponent implements OnInit {

  vm$: Observable<ViewModel>;
  formPermissions$: Observable<FormPermission>;
  showNav$: Observable<boolean>;

  constructor (
    private route: ActivatedRoute,
    private translate: TranslateService,
    private formService: FormService,
    private documentViewerFacade: DocumentViewerFacade,
    private projectFormService: ProjectFormService,
    private formPermissionService: FormPermissionService,
    public userService: UserService,
    private router: Router
) {}

  ngOnInit(): void {
    const projectForm$ = this.projectFormService.getProjectFormFromRoute$(this.route);

    const rights$ = projectForm$.pipe(
      switchMap(projectForm => this.formPermissionService.getRights(projectForm.form).pipe(
        mergeMap(_rights => this.userService.user$.pipe(
          map(user => ({..._rights, ictAdmin: UserService.isIctAdmin(user)} as Rights))
        ))
        )
      )
    );

    this.vm$ = combineLatest(projectForm$, rights$, this.route.queryParams).pipe(
      map(([projectForm, rights, queryParams]) => ({
          form: projectForm.form,
          navLinks: this.getNavLinks(projectForm, rights, queryParams),
        })
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

    this.showNav$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
      startWith(this.router.url),
      mergeMap((url: string) =>
        form$.pipe(
          map(form =>
            !(
              (!form.options?.useNamedPlaces && url.match(/\/form$/))
              || (form.options?.useNamedPlaces && url.match(/\/places\/MNP\.\d+$/))
              || (url.match(/\/form\/(.*\/)?((JX\.)|(T:))\d+$/))
            )
          )
        )

      )
    );
  }

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
      default:
        return [];
    }
  }

  private static getFormRoutes(form: Form.SchemaForm, subForms: Form.List[], rights: Rights) {
    const _subForms = subForms.filter(_form => _form.options?.sidebarFormLabel);
    return [form, ..._subForms].filter(_form =>
      _form.options?.useNamedPlaces && rights.view
      || !_form.options?.useNamedPlaces && rights.edit
    ).map(_form => ({
      link:  [`form${(_form === form && !_subForms.length) ? '' : `/${_form.id}`}`],
      label: _form.options.sidebarFormLabel || 'nafi.form'
    }));
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
        label: 'instructions'
      },
      form.options?.resultServiceType && {
        link: ['stats'],
        label: 'nafi.stats',
        children: ProjectFormComponent.getResultServiceRoutes(form.options?.resultServiceType, queryParams)
      },
      ...ProjectFormComponent.getFormRoutes(form, subForms, rights),
      rights.edit && allowExcel && {
        link: ['import'],
        label: 'excel.import',
      },
      rights.edit && allowExcel && {
        link: ['generate'],
        label: 'excel.generate'
      },
      rights.edit && {
        link: ['submissions'],
        label: this.projectFormService.getSubmissionsPageTitle(form, rights.admin)
      },
      rights.edit && form.options?.allowTemplate && {
        link: ['templates'],
        label: 'haseka.templates.title'
      },
      (rights.admin || rights.ictAdmin) && form.options?.hasAdmins && {
        link: ['admin'],
        label: 'form.administer',
        children: [
          {
            link: ['admin', 'instructions'],
            label: 'Ohje',
          },
          {
            link: ['admin', 'accept'],
            label: 'Pääsypyynnöt',
            content: {
              template: 'badge',
              count: 'permissionRequests'
            } as BadgeTemplate
          },
          {
            link: ['admin', 'manage', 'editors'],
            label: 'Hyväksytyt',
            content: {
              template: 'badge',
              count: 'editors'
            } as BadgeTemplate
          },
          {
            link: ['admin', 'manage', 'admins'],
            label: 'Ylläpitäjät',
            content: {
              template: 'badge',
              count: 'admins'
            } as BadgeTemplate
          },
          {
            link: ['admin', 'participants'],
            label: 'Osallistujaraportti'
          },
        ]
      }
    ].filter(n => n);
  }

  showDocumentViewer(document: Document) {
    this.documentViewerFacade.showDocument({document, own: true});
  }

  trackByLabel(index, link) {
    return link.label;
  }
}
