import { Inject, Injectable, OnDestroy, Renderer2, RendererFactory2, ViewEncapsulation } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DOCUMENT, Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Global } from '../../../environments/global';
import { PlatformService } from './platform.service';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from '../../locale/localize-router.service';

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
const MAIN_IMAGE = 'https://cdn.laji.fi/images/logos/LAJI_FI_valk.png';

interface ILinkElement {
  rel: string;
  href?: string;
  hreflang?: string;
}

interface IHeaders {
  title?: string;
  'twitter:title'?: string;
  'og:title'?: string;
  description?: string;
  'og:description'?: string;
  'twitter:description'?: string;
  'og:image'?: string;
  'twitter:image'?: string;
  'twitter:card'?: string;
  'og:url'?: string;
  canonicalUrl?: ILinkElement;
  alternativeLinks?: ILinkElement[];
}

export const getDescription = (html: string): string => {
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
};

const getRouteTitles = (routeSnapshot: ActivatedRouteSnapshot): string[] => {
  const titles: string[] = [];
  if (routeSnapshot.data && routeSnapshot.data['title']) {
    titles.push(routeSnapshot.data['title'] ?? '');
  }
  if (routeSnapshot.firstChild) {
    return [...getRouteTitles(routeSnapshot.firstChild), ...titles];
  }
  return titles;
};

const removeDuplicates = <T>(arr: T[]) => Array.from(new Set<T>(arr));

const getDeepestChildValue = (routeSnapshot: ActivatedRouteSnapshot, key = 'meta', empty: any = {}): any => {
  const value = routeSnapshot.data && typeof routeSnapshot.data[key] !== 'undefined' ? routeSnapshot.data[key] : empty;
  if (routeSnapshot.firstChild) {
    return getDeepestChildValue(routeSnapshot.firstChild, key, value);
  }
  return value;
};

/**
 * 1. On NavigationEnd infer headers from route
 * 2. In components overwrite headers by calling setHeaders
 */
@Injectable({
  providedIn: 'root'
})
export class HeaderService implements OnDestroy {
  private inferredHeaders: IHeaders;
  private currentRoute: string;
  private renderer: Renderer2;
  private routeSub: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private platformService: PlatformService,
    private translateService: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private location: Location,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(this.document, {
      id: '-1',
      encapsulation: ViewEncapsulation.None,
      styles: [],
      data: {}
    });

    const title = this.translateService.instant(MAIN_TITLE);
    const description = this.translateService.instant(MAIN_DESCRIPTION);

    this.inferredHeaders = {
      title: title,
      'og:title': title,
      'twitter:title': title,
      description: description,
      'og:description': description,
      'twitter:description': description,
      'og:image': MAIN_IMAGE,
      'twitter:image': MAIN_IMAGE,
      'twitter:card': 'summary_large_image',
      'og:url': '',
      canonicalUrl: {
        rel: 'canonical',
      },
      alternativeLinks: [
        {
          rel: 'alternative',
          hreflang: 'fi'
        },
        {
          rel: 'alternative',
          hreflang: 'sv'
        },
        {
          rel: 'alternative',
          hreflang: 'en'
        }
      ]
    };
  }

  public initialize() {
    const canonicalEl = this.renderer.createElement('link');
    this.renderer.setAttribute(canonicalEl, 'rel', this.inferredHeaders.canonicalUrl.rel);
    this.renderer.appendChild(this.document.head, canonicalEl);

    this.inferredHeaders.alternativeLinks.forEach(link => {
      const el = this.renderer.createElement('link');
      this.renderer.setAttribute(el, 'rel', link.rel);
      this.renderer.setAttribute(el, 'hreflang', link.hreflang);
      this.renderer.appendChild(this.document.head, el);
    });

    this.metaService.addTags([
      {property: 'og:title'},
      {property: 'og:description'},
      {property: 'og:image'},
      {property: 'og:url'},
      {name: 'twitter:title'},
      {name: 'twitter:description'},
      {name: 'twitter:image'},
      {name: 'twitter:card'}
    ]);

    this.startRouteListener();
  }

  public setHeaders(headers: IHeaders): void {
    if (!this.platformService.isBrowser) { return; }

    Object.entries(headers).forEach(([key, value]) => {
      switch (key) {
        case 'title':
          this.titleService.setTitle(value);
          break;
        case 'description':
        case 'og:title':
        case 'og:description':
        case 'og:image':
        case 'og:url':
          this.metaService.updateTag({property: key, content: value});
          break;
        case 'twitter:description':
        case 'twitter:image':
        case 'twitter:title':
        case 'twitter:card':
          this.metaService.updateTag({name: key, content: value});
          break;
        case 'canonicalUrl':
          this.updateLink(value);
          this.metaService.updateTag({property: 'og:url', content: value.href});
          break;
        case 'alternativeLinks':
          value.forEach(v => this.updateLink(v));
          break;
      }
    });
  }

  private updateLink(link: ILinkElement) {
    const el = link.hreflang
               ? this.document.querySelector(`link[rel='${link.rel}'][hreflang='${link.hreflang}']`)
               : this.document.querySelector(`link[rel='${link.rel}']`);
    if (!el) {
      return;
    }
    if (link.href) {
      this.renderer.setAttribute(el, 'href', link.href);
    }
    if (link.hreflang) {
      this.renderer.setAttribute(el, 'hreflang', link.hreflang);
    }
  }

  private startRouteListener(): void {
    if (!this.platformService.isBrowser) { return; }

    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.location.path() || '/'),
      filter(newRoute => this.currentRoute !== newRoute)
    ).subscribe(newRoute => {
      this.currentRoute = newRoute;

      const titles = removeDuplicates(
        [...getRouteTitles(this.router.routerState.snapshot.root), MAIN_TITLE]
      );
      const titlesTranslated = this.translateService.instant(titles);
      const titleString = Object.keys(titlesTranslated).map(key => decodeURI(titlesTranslated[key])).join(' | ');
      this.inferredHeaders.title = titleString;

      const c = getDeepestChildValue(this.router.routerState.snapshot.root, 'canonical', '');
      const canonicalUrl = c ? this.localizeRouterService.translateRoute(c, this.translateService.currentLang) : newRoute;
      this.inferredHeaders.canonicalUrl = {href: canonicalUrl, rel: 'canonical'};

      this.inferredHeaders.alternativeLinks = this.localizeRouterService.locales.map(
        lang => ({
          href: environment.base + this.localizeRouterService.translateRoute(newRoute, lang),
          hreflang: lang,
          rel: 'alternative'
        })
      );

      this.setHeaders(this.inferredHeaders);
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
