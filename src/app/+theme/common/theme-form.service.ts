import { Injectable } from '@angular/core';
import { FormService } from '../../shared/service/form.service';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import merge from 'deepmerge';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { UserService } from '../../shared/service/user.service';
import { Form } from '../../shared/model/Form';

export interface NavLink {
  routerLink: string[];
  label: string;
  adminLabel?: string;
  accessLevel?: 'admin' | 'editor';
  children?: NavLink[];
  active?: boolean;
  name?: string;
  activeMatch?: string;
  hidden?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeFormService {

  defaultNavLinks: {[name: string]: NavLink} = {
    instructions: {
      routerLink: ['instructions'],
      label: 'instructions',
    },
    form: {
      routerLink: ['form'],
      label: 'nafi.form',
      accessLevel: 'editor'
    },
    ownSubmissions: {
      routerLink: ['ownSubmissions'],
      label: 'haseka.ownSubmissions.title',
      adminLabel: 'theme.admin.submissions',
      accessLevel: 'editor'
    },
    formPermissions: {
      routerLink: ['/vihko/fp/%{collectionID}/admin'],
      label: 'form.administer',
      accessLevel: 'admin'
    }
  };

  static getFormId(route: ActivatedRouteSnapshot): string {
    let current = route;
    while (
      current && current.parent &&
      !(current.data && current.data['formID']) &&
      !(current.params && current.params['formID'])
      ) {
      current = current.parent;
    }
    if (current) {
      if (current.data && current.data['formID']) {
        return current.data['formID'];
      } else if (current.params && current.params['formID']) {
        return current.params['formID'];
      }
    }
    return null;
  }


  constructor(private formService: FormService,
              private formPermissionService: FormPermissionService,
              private translateService: TranslateService,
              private userService: UserService
  ) { }

  getForm(route: ActivatedRouteSnapshot): Observable<Form.SchemaForm> {
    const formID = ThemeFormService.getFormId(route);
    if (!formID) {
      throw new Error('No form ID found from the route.');
    }
    return this.formService.getForm(formID, this.translateService.currentLang);
  }

  getNavLinks$(route: ActivatedRoute): Observable<NavLink[]> {
    const formID = ThemeFormService.getFormId(route.snapshot);
    return route.data.pipe(
      switchMap(({navLinks = {}, navLinksOrder = [], navLinksNoAccess, navLinksSecondary}) => this.formService.getForm(
        formID,
        this.translateService.currentLang
      ).pipe(
          switchMap(form => this.formPermissionService.getRights(form).pipe(
            switchMap(rights => this.userService.user$.pipe(
              take(1),
              map((user) => UserService.isAdmin(user) ? {...rights, admin: true} : rights)
            )),
            map(rights => this.getNavLinks(
                merge(this.defaultNavLinks, navLinks),
                navLinksOrder,
                navLinksSecondary,
                navLinksNoAccess,
                rights,
                form
              )
            )
          ))
        )
      )
    );
  }

  private getNavLinks(
    navLinks: {[name: string]: NavLink},
    order,
    orderSecondary,
    orderNoAccess,
    rights: Rights,
    form: Form.List
  ): NavLink[] {
    const getNav = (navLink: NavLink): NavLink => {
      let {routerLink} = navLink;
      const {label, adminLabel, children} = navLink;
      routerLink = routerLink.map(link => link.replace('%{collectionID}', form.collectionID));
      return {
        ...navLink,
        routerLink,
        label: adminLabel && rights.admin
          ? adminLabel
          : label,
        children: children ? children.map(getNav) : undefined
      };
    };
    if (orderSecondary && FormService.hasFeature(form, Form.Feature.SecondaryCopy)) {
      order = orderSecondary;
    }
    if (orderNoAccess && !rights.edit) {
      order = orderNoAccess;
    }
    return order
      .reduce((links, name) => [...links, {name, ...navLinks[name]}], [])
      .filter(({accessLevel, visible = true}) =>
        visible
        && (
          !accessLevel
          || accessLevel === 'admin' && rights.admin
          || accessLevel === 'editor' && rights.edit
        )
      ).map(getNav);
  }
}
