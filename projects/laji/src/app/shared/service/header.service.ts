import { Inject, Injectable, OnDestroy, Renderer2, RendererFactory2, ViewEncapsulation } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { DOCUMENT, Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Global } from '../../../environments/global';
import { PlatformService } from './platform.service';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { RouteDataService } from './route-data.service';

let MAIN_TITLE: string;
switch (environment.type) {
  case Global.type.iucn:
    MAIN_TITLE = 'iucn.page.title';
    break;
  case Global.type.vir:
    MAIN_TITLE = 'vir.page.title';
    break;
  default:
    MAIN_TITLE = 'home.main-page.title';
    break;
}
const MAIN_DESCRIPTION = 'footer.intro1';

const ALL_META_KEYS = [
  'description',
  'og:description',
  'twitter:description'
];

const ALL_IMAGE_KEYS = [
  'og:image',
  'twitter:image'
];

const TWITTER_CARD = [
  'twitter:card',
  'twitter:title'
];

@Injectable({
  providedIn: 'root'
})
export class HeaderService implements OnDestroy {

  private routeSub: Subscription;
  private currentRoute: string;
  private renderer: Renderer2;

  public static getDescription(html: string): string {
    const firstParagraph = html
      .split('</p>')[0]
      .split(/<p.*?>/).pop()
      .replace(/<[^>]*>?/gm, '');

    if (firstParagraph.length <= 180) {
      return firstParagraph;
    }
    const words = firstParagraph.substring(0, 181).split(' ');
    let description = words[0];

    for (let i = 1; i < words.length; i++) {
      if (description.length + words[i].length + 1 <= 177) {
        description += ` ${words[i]}`;
      } else {
        break;
      }
    }
    return `${description}...`;
  }

  constructor(
    @Inject(DOCUMENT) private document,
    private router: Router,
    private location: Location,
    private platformService: PlatformService,
    private title: Title,
    private translateService: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private metaService: Meta,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(this.document, {
      id: '-1',
      encapsulation: ViewEncapsulation.None,
      styles: [],
      data: {}
    });
  }

  public startRouteListener(): void {
    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.location.path() || '/'),
      filter(newRoute => this.currentRoute !== newRoute)
    ).subscribe((newRoute) => {
      this.currentRoute = newRoute;

      // Set page title
      this.getDeepestTitle(this.router.routerState.snapshot.root).pipe(
        map(titles => [...titles, MAIN_TITLE]),
        map(titles => Array.from(new Set<string>(titles))),
        switchMap(titles => this.translateService.get(titles))
      ).subscribe(pageTitle => {
        this.title.setTitle(Object.keys(pageTitle).map(key => decodeURI(pageTitle[key])).join(' | '));
      });

      // Set page meta tags
      RouteDataService.getDeepest<object>(this.router.routerState.snapshot.root).pipe(
        map(meta => ({description: MAIN_DESCRIPTION, ...meta}))
      ).subscribe(meta => {
        const ArraysMeta = [...ALL_META_KEYS, ...ALL_IMAGE_KEYS, ...TWITTER_CARD];
        ArraysMeta.map((key) => {
          const propertySelector = ((key === 'twitter:card' || key === 'twitter:title' ) ? `name='${key}'` : `property='${key}'`);
          if (meta?.[key]) {
            this.metaService.updateTag({property: key, content: this.translateService.instant(meta[key])}, propertySelector);
          } else {
            this.metaService.removeTag(propertySelector);
          }
        });
      });

      // Set canonical link
      RouteDataService.getDeepest<string>(this.router.routerState.snapshot.root, 'canonical', '').subscribe(canonical => {
        this.updateCanonicalUrl(canonical ? this.localizeRouterService.translateRoute(canonical, this.translateService.currentLang) : newRoute);
      });

      this.updateAlternativeLinks(newRoute);
    });
  }

  public createTwitterCard(title) {
    this.removeMetaTags(TWITTER_CARD);
    this.metaService.addTag({name: 'twitter:card', content: 'summary_large_image'});
    TWITTER_CARD.forEach((key) => {
      if (key !== 'twitter:card') {
        this.metaService.addTag({ name: key, content: title });
      }
    });
  }

  public updateMetaDescription(description) {
    this.removeMetaTags(ALL_META_KEYS);
    ALL_META_KEYS.forEach((key) => {
      this.metaService.addTag({ property: key, content: description });
    });
  }

  public updateFeatureImage(image) {
    this.removeMetaTags(ALL_IMAGE_KEYS);
    ALL_IMAGE_KEYS.forEach((key) => {
      this.metaService.addTag({ property: key, content: image });
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  private updateCanonicalUrl(path: string) {
    this.removeElements('link[rel="canonical"]');
    this.addLink({
      href: environment.base + path,
      rel: 'canonical'
    });
  }

  private updateAlternativeLinks(path: string) {
    this.removeElements('link[rel="alternative"]');
    this.localizeRouterService.locales.forEach(lang => {
      this.addLink({
        href: environment.base + this.localizeRouterService.translateRoute(path, lang),
        hreflang: lang,
        rel: 'alternative'
      });
    });
  }

  private removeMetaTags(metaTagsDescription) {
    this.metaService.removeTag('property="twitter:card"');
    RouteDataService.getDeepest<object>(this.router.routerState.snapshot.root).pipe(
      map(meta => ({description: MAIN_DESCRIPTION, ...meta}))
    ).subscribe(meta => {
      metaTagsDescription.forEach((key) => {
        const propertySelector = `property='${key}'`;
        if (meta?.[key]) {
          this.metaService.removeTag(propertySelector);
        }
      });
    });
  }

  private removeElements(selector: string) {
    if (this.platformService.isBrowser) {
      const alternatives = this.document.querySelectorAll(selector);
      if (alternatives.length) {
        alternatives.forEach(elem => this.renderer.removeChild(this.document.head, elem));
      }
    }
  }

  private addLink(options: {[key: string]: string}): void {
    const linkElt = this.renderer.createElement('link');
    Object.keys(options).forEach(key => {
      this.renderer.setAttribute(linkElt, key, options[key]);
    });
    this.renderer.appendChild(this.document.head, linkElt);
  }

  private getDeepestTitle(routeSnapshot: ActivatedRouteSnapshot): Observable<string[]> {
    const title = [];
    if (routeSnapshot.data && routeSnapshot.data['title']) {
      title.push(routeSnapshot.data['title'] || '');
    }
    if (routeSnapshot.firstChild) {
      return this.getDeepestTitle(routeSnapshot.firstChild).pipe(
        map(label => [...label, ...title])
      );
    }
    return ObservableOf(title);
  }

}
