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

  uri: string | undefined;
  highlight: string | undefined;
  own: boolean | undefined;
  openAnnotation: boolean | undefined;
  private subQuery!: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.subQuery = this.route.queryParams.pipe(
      mergeMap(params => this.route.fragment.pipe(
        map(fragment => (<any>{
          ...params,
          highlight: fragment ? (params['uri'] || '') + '#' + fragment : (params['highlight'] || '').replace('%23', '#')
        }))
      ))
    ).subscribe(params => {
      this.uri = params['uri'];
      this.highlight = params['highlight'];
      this.own = params['own'] === 'true';
      this.openAnnotation = params['openAnnotation'] === 'true';
    });
  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

}
