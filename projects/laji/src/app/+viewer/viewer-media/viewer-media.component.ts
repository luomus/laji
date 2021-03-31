import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';
import { Image } from 'projects/laji/src/app/shared/gallery/image-gallery/image.interface';


@Component({
  selector: 'laji-viewer-media',
  templateUrl: './viewer-media.component.html',
  styleUrls: ['./viewer-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerMediaComponent implements OnInit, OnDestroy {
  public images: Image[];
  private subQuery: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.subQuery = this.route.queryParams.pipe(
        map(params => ({
         image: {
           copyrightOwner : params['owner'],
           licenseId: params['rights'],
           fullURL: params['uri']
         }
        })
      )
    ).subscribe(params => {
      this.images = [params['image']];
    });

  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

}
