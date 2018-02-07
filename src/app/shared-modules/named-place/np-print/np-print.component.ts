import {Component, ElementRef, Inject, OnDestroy, OnInit} from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { NamedPlacesService } from '../named-places.service';
import { UserService } from '../../../shared/service/user.service';
import { FooterService } from '../../../shared/service/footer.service';
import { Person } from '../../../shared/model/Person';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'laji-np-print',
  templateUrl: './np-print.component.html',
  styleUrls: ['./np-print.component.css']
})
export class NpPrintComponent implements OnInit, OnDestroy {

  public form: any;
  public namedPlace: NamedPlace;
  public person: Person;

  private subData: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private namedPlaceService: NamedPlacesService,
    private userService: UserService,
    private footerService: FooterService
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subData = Observable.combineLatest(
      this.userService.getUser(),
      this.route.params,
      this.translate.onLangChange
        .startWith({lang: this.translate.currentLang}),
      (person, params, lang) => ({
        person: person,
        params: params,
        lang: lang
      }))
      .switchMap(data => Observable.forkJoin(
        this.namedPlaceService
          .getNamedPlace(data.params['npId'], this.userService.getToken())
          .catch(() => Observable.of({})),
        (ns) => ({
          person: data.person,
          ns: ns,
          params: data.params
        })
      ))
      .subscribe(data => {
        this.namedPlace = data.ns;
        this.person = data.person;
      });
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
    if (this.subData) {
      this.subData.unsubscribe();
    }
  }

  print() {
    if (isPlatformBrowser(this.platformId)) {
      console.log(this.stripScripts(document.getElementsByTagName('html')[0].innerHTML));
    }
  }

  private stripScripts(s) {
    if (isPlatformBrowser(this.platformId)) {
      const div = document.createElement('div');
      div.innerHTML = s;
      const scripts = div.getElementsByTagName('script');
      let i = scripts.length;
      while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
      }
      return div.innerHTML;
    }
  }

}
