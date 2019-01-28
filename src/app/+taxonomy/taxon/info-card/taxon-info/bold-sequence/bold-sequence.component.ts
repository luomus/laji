import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaxonomyApi } from '../../../../../shared/api/TaxonomyApi';

@Component({
  selector: 'laji-bold-sequence',
  templateUrl: './bold-sequence.component.html',
  styleUrls: ['./bold-sequence.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoldSequenceComponent {

  private static readonly resultUrl = 'http://boldsystems.org/index.php/Public_BINSearch?query=%taxon%&searchBIN=Search+BINs';

  count = 0;
  link = '';
  @Input() cursive = false;

  private _scientificName: string;

  constructor(
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private taxonApi: TaxonomyApi
  ) { }


  @Input()
  set scientificName(name: string) {
    this.count = 0;
    this.link = '';
    this._scientificName = name;
    this.taxonApi.bold(name)
      .subscribe((result) => {
        this.count = result['total_records'] || 0;
        this.link = this.getUrl(BoldSequenceComponent.resultUrl, name);
        this.cdr.markForCheck();
      }, (err) => console.log(err));
  }

  get scientificName() {
    return this._scientificName;
  }

  private getUrl(base: string, name: string) {
    return base.replace('%taxon%', encodeURIComponent(name));
  }

}
