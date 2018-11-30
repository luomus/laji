import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxonomy.component.html',
  styleUrls: ['./taxonomy.component.css']
})
export class TaxonomyComponent implements OnInit {
  taxonId: string;
  showFilter = true;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(data => {
      this.taxonId = data['id'];
      this.cd.markForCheck();
    });
  }
}
