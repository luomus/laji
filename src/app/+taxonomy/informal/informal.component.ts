import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';
import { SearchQuery } from '../../+observation/search-query.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-informal',
  templateUrl: './informal.component.html',
  styleUrls: ['./informal.component.css']
})
export class InformalComponent implements OnInit, OnDestroy {
  public informalTaxonGroupId: string;

  private subParam: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private searchQuery: SearchQuery,
    private footerService: FooterService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subParam = this.route.params.map(params => params['id']).subscribe(id => {
      this.informalTaxonGroupId = id;
    });

    this.subQuery = this.route.queryParams.subscribe(params => {
      this.searchQuery.setQueryFromQueryObject(params);
      if (params['reset']) {
        this.searchQuery.query = {};
      }
      if (params['target']) {
        this.searchQuery.query.target = [params['target']];
      }
      this.searchQuery.queryUpdate({formSubmit: !!params['reset'], newData: true});
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }
}
