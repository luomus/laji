import { Component, OnInit, OnDestroy } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from 'ng2-translate/ng2-translate';

import {InformationApi, Information} from "../shared";

@Component({
  selector: 'laji-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
  providers: [ InformationApi ],
  directives: [ ROUTER_DIRECTIVES ]
})
export class InformationComponent implements OnDestroy {

  information:Information;
  private paramSub:Subscription;
  private transSub:Subscription;

  constructor(
    private route: ActivatedRoute,
    private informationService:InformationApi,
    private translate:TranslateService
  ) {
    this.paramSub = this.route.params.subscribe(params => {
      this.getInformation(params['id'] || null);
    });
    this.transSub = this.translate.onLangChange.subscribe(
      () => {
        this.getInformation();
      }
    );
  }

  ngOnDestroy() {
    this.paramSub.unsubscribe();
    this.transSub.unsubscribe();
  }

  private getInformation(id?) {
    if (id) {
      this.informationService
        .informationFindById(id, this.translate.currentLang)
        .subscribe(
          information => {
            if (information.id === null) {

            } else {
              this.information = information
            }
          },
          err => console.log(err)
        );
    } else {
      this.informationService
        .informationFindAll(this.translate.currentLang)
        .subscribe(
          information => this.information = information,
          err => console.log(err)
        );
    }
  }

}
