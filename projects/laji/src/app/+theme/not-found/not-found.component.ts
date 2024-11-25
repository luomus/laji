import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Global } from '../../../environments/global';
import { BrowserService } from '../../shared/service/browser.service';
import { FormService } from '../../shared/service/form.service';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'laji-theme-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent implements OnInit {

  constructor(
    private router: Router,
    private browserService: BrowserService,
    private formService: FormService
  ) { }

  ngOnInit() {
    const [uri, queryParams] = this.browserService.getPathAndQueryFromUrl(this.router.url);
    const [, formName = '', subRoute = ''] = uri.match(/theme\/([^\/]+)(\/.+)?$/) || [];
    const formID = Global.oldThemeRouting[<keyof typeof Global.oldThemeRouting>formName];
    if (!formID) {
      return;
    }
    const redirectionBase = `/project/${formID}`;
    let redirectionSubRoute = '';
    if (subRoute === '/instructions') {
      this.formService.getForm(formID).pipe(
        take(1),
        map(form => form?.options?.instructions ? '/instructions' : '/about')
      ).subscribe(sub => {
        this.router.navigate([`${redirectionBase}${sub}`], {queryParams});
      });
      return;
    } else if (subRoute === '/own-submissions') {
      redirectionSubRoute = '/submissions';
    } else if (subRoute === '/form') {
      redirectionSubRoute = '/form';
    } else if (subRoute === '/templates') {
      redirectionSubRoute = '/templates';
    } else if (subRoute.startsWith('/stats')) {
      redirectionSubRoute = subRoute;
    } else if (subRoute.startsWith('/statistics')) {
      const document = subRoute.replace('/statistics', '');
      redirectionSubRoute = `/submissions/${document}`;
    } else if (subRoute.startsWith('/places')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const subFormID = subRoute.match(/\/places\/[^/]+\/([^/]+)/)![1];
      const parent = Global.oldThemeParents[<keyof typeof Global.oldThemeParents>subFormID];
      if (parent) {
        redirectionSubRoute = `/form/${subFormID}/places`;
      } else {
        redirectionSubRoute = `/form/places`;
      }
      if (queryParams.edit === 'true') {
        if (queryParams.activeNP) {
          redirectionSubRoute = `${redirectionSubRoute}/${queryParams.activeNP}/edit`;
        } else {
          redirectionSubRoute = `${redirectionSubRoute}/new`;
        }
      }
    }

    this.router.navigate([`${redirectionBase}${redirectionSubRoute}`], {queryParams});
  }
}
