import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { NamedPlacesService } from '../named-places.service';
import { UserService } from '../../../shared/service/user.service';
import { FooterService } from '../../../shared/service/footer.service';
import { Person } from '../../../shared/model/Person';

@Component({
  selector: 'laji-np-print',
  templateUrl: './np-print.component.html'
})
export class NpPrintComponent implements OnInit, OnDestroy {

  public form: any;
  public namedPlace: NamedPlace;
  public person: Person;

  private subData: Subscription;

  constructor(
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
        this.namedPlaceService.getNamedPlace(data.params['npId'], this.userService.getToken()),
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

}
