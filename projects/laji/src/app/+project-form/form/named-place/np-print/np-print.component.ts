import { catchError, map, startWith, switchMap, take } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as FileSaver from 'file-saver';
import { combineLatest as ObservableCombineLatest, Observable, of as ObservableOf, Subscription } from 'rxjs';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../shared/service/user.service';
import { FooterService } from '../../../../shared/service/footer.service';
import { Person } from '../../../../shared/model/Person';
import { LajiApi, LajiApiService } from '../../../../shared/service/laji-api.service';
import { PlatformService } from '../../../../shared/service/platform.service';
import { NamedPlacesService } from '../../../../shared/service/named-places.service';
import { ProjectFormService } from '../../../project-form.service';

@Component({
  selector: 'laji-np-print',
  templateUrl: './np-print.component.html',
  styleUrls: ['./np-print.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpPrintComponent implements OnInit, OnDestroy {

  namedPlace$: Observable<NamedPlace>;
  loading = false;

  constructor(
    private platformService: PlatformService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private namedPlaceService: NamedPlacesService,
    private userService: UserService,
    private footerService: FooterService,
    private lajiApiService: LajiApiService,
    private cdr: ChangeDetectorRef,
    private projectFormService: ProjectFormService
  ) { }

 ngOnInit() {
    this.footerService.footerVisible = false;
    this.namedPlace$ = this.projectFormService.getNamedPlacesRouteData$(this.route).pipe(map(data => data.namedPlace));
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }

  print(fileName) {
    this.loading = true;
    if (this.platformService.isBrowser) {
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, this.prepareHtml(document.getElementsByTagName('html')[0].innerHTML))
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

  private prepareHtml(s: string) {
    // Make absolute SVG ids relative
    s = s.replace(/xlink:href=".*?#/g, 'xlink:href="#');
    return s;
  }

}
