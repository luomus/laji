import { Component, Input, OnInit } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../logger/logger.service';
import { LajiApiService } from '../service/laji-api.service';
import { map } from 'rxjs/operators';
import { HeaderImage, HeaderImageService } from '../service/header-image.service';
import { BaseDataService } from '../../graph-ql/service/base-data.service';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {

  @Input() onFrontPage = false;

  public tree$: Observable<any>;
  public headerImage: HeaderImage;

  constructor(
    public footerService: FooterService,
    private lajiApi: LajiApiService,
    private translate: TranslateService,
    private logger: Logger,
    private headerImageService: HeaderImageService,
    private baseDataService: BaseDataService
  ) {
  }

  ngOnInit() {
    this.headerImage = this.headerImageService.getCurrentSeason();
    this.tree$ = this.baseDataService.getBaseData().pipe(
      map(data => data.information && data.information.children || [])
    );
  }
}
