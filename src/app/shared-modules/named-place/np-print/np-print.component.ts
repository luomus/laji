import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as FileSaver from 'file-saver';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { NamedPlacesService } from '../named-places.service';
import { UserService } from '../../../shared/service/user.service';
import { FooterService } from '../../../shared/service/footer.service';
import { Person } from '../../../shared/model/Person';
import {isPlatformBrowser} from '@angular/common';
import {LajiApi, LajiApiService} from '../../../shared/service/laji-api.service';

@Component({
  selector: 'laji-np-print',
  templateUrl: './np-print.component.html',
  styleUrls: ['./np-print.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpPrintComponent implements OnInit, OnDestroy {

  form: any;
  namedPlace: NamedPlace;
  person: Person;
  loading = false;

  private subData: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private namedPlaceService: NamedPlacesService,
    private userService: UserService,
    private footerService: FooterService,
    private lajiApiService: LajiApiService,
    private cdr: ChangeDetectorRef
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
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
    if (this.subData) {
      this.subData.unsubscribe();
    }
  }

  print(fileName) {
    this.loading = true;
    if (isPlatformBrowser(this.platformId)) {
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, this.stripHTML(document.getElementsByTagName('html')[0].innerHTML))
        .subscribe((response) => {
          FileSaver.saveAs(response, fileName + '.pdf');
          this.loading = false;
          this.cdr.markForCheck();
        }, () => {
          this.loading = false;
          this.cdr.markForCheck();
        });
    }
  }

  private stripHTML(s: string) {
    // Strip scripts
    s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Make absolute SVG ids relative
    s = s.replace(/xlink:href=".*?#/g, 'xlink:href="#');
    return s;
  }

}
