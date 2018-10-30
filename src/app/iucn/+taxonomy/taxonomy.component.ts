import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-taxonomy',
  template: `
    <div class="container">
      <laji-info-card [taxonId]="taxon"></laji-info-card>
    </div>
  `,
  styles: []
})
export class TaxonomyComponent implements OnInit, OnDestroy {

  taxon: string;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.subParam = this.route.params
      .subscribe((params) => {
        this.taxon = params['id'];
      });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

}
