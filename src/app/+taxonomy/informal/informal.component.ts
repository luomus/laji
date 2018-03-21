import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FooterService } from '../../shared/service/footer.service';

@Component({
  selector: 'laji-informal',
  templateUrl: './informal.component.html',
  styleUrls: ['./informal.component.css']
})
export class InformalComponent implements OnInit, OnDestroy {
  public informalTaxonGroupId: string;

  constructor(
    private route: ActivatedRoute,
    private footerService: FooterService
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;

    this.route.params.map(params => params['id']).subscribe(id => {
      this.informalTaxonGroupId = id;
    });
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }
}
