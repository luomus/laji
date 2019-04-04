import { Injectable } from '@angular/core';
import { FormService } from '../../shared/service/form.service';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import merge from 'deepmerge';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';

export interface NavLink {
  routerLink: string[];
  label: string;
  adminLabel?: string;
  accessLevel?: 'admin' | 'editor';
  children?: NavLink[];
  active?: boolean;
  name?: string;
  activeMatch?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeFormService {

  defaultNavLinks = {
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

  constructor(private formService: FormService,
              private formPermissionService: FormPermissionService,
              private translateService: TranslateService
  ) { }

  getForm(route: ActivatedRoute): Observable<any> {
    return route.parent.data.pipe(
      switchMap(({formID}) => this.formService.getForm(formID, this.translateService.currentLang))
    );
  }

  getNavLinks$(route: ActivatedRoute): Observable<NavLink[]> {
    return route.data.pipe(
      switchMap(({formID, navLinks = {}, navLinksOrder = []}) => this.formService.getForm(formID, this.translateService.currentLang).pipe(
          switchMap(form => this.formPermissionService.getRights(form).pipe(
            map(rights => (this.getNavLinks(
                merge(this.defaultNavLinks, navLinks),
                navLinksOrder,
                rights,
                form.collectionID
              )
            ))
          ))
        )
      )
    );
  }

  private getNavLinks(navLinks: {[name: string]: NavLink}, order, rights: Rights, collectionID: string, url?: string): NavLink[] {
    const orderIdxs = order.reduce((o, name, i) => {
      o[name] = i;
      return o;
    }, {});

    const getNav = (navLink: NavLink): NavLink => {
      let {routerLink} = navLink;
      const {label, adminLabel, children} = navLink;
      routerLink = routerLink.map(link => link.replace('%{collectionID}', collectionID));
      return {
        ...navLink,
        routerLink,
        label: adminLabel && rights.admin
          ? adminLabel
          : label,
        children: children ? children.map(getNav) : undefined
      };
    };

    return Object.keys(navLinks)
      .sort((a, b) => {
        const [ai, bi] = [a, b].map(k => orderIdxs[k]);
        if (ai === undefined && bi !== undefined) {
          return 1;
        } else if (bi === undefined && ai !== undefined) {
          return -1;
        }
        return ai - bi;
      })
      .reduce((links, name) => [...links, {name, ...navLinks[name]}], [])
      .filter(({accessLevel}) =>
        !accessLevel
        || accessLevel === 'admin' && rights.admin
        || accessLevel === 'editor' && rights.edit
      ).map(getNav);
  }
}
