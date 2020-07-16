import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'laji-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit, OnDestroy {

  public uri: string;
  public highlight: string;
  public own: boolean;
  public openAnnotation: boolean;
  private subQuery: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.subQuery = this.route.queryParams.pipe(
      mergeMap(params => this.route.fragment.pipe(
        map(fragment => ({
          ...params,
          highlight: fragment ? (params['uri'] || '') + '#' + fragment : (params['highlight'] || '').replace('%23', '#')
        }))
      ))
    ).subscribe(params => {
      this.uri = params['uri'];
      this.highlight = params['highlight'];
      this.own = params['own'].toLocaleLowerCase() === 'true' ? true : false;
      this.openAnnotation = params['openAnnotation'].toLocaleLowerCase() === 'true' ? true : false;;
    });
  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

}
