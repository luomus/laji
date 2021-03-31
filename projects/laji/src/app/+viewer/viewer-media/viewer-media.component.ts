import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';
import { Image } from 'projects/laji/src/app/shared/gallery/image-gallery/image.interface';
import { IdService } from '../../shared/service/id.service';
import { ImageApi } from '../../shared/api/ImageApi';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { TranslateService } from '@ngx-translate/core';




@Component({
  selector: 'laji-viewer-media',
  templateUrl: './viewer-media.component.html',
  styleUrls: ['./viewer-media.component.scss'],
  providers: [IdService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerMediaComponent implements OnInit, OnDestroy {
  public images: Observable<Image>;
  public uri: string;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private imageApi: ImageApi,
    private translate: TranslateService,
    ) { }

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(params => {
      this.uri = IdService.getId(params['uri']);
      console.log(this.uri);

    });

    this.images = this.imageApi.imageFindById(this.uri, this.translate.currentLang);
    console.log(this.images);

  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

}
