import { Component, OnChanges, Input } from '@angular/core';
import { MetadataService } from '../../../../../shared/service/metadata.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'laji-administrative-status',
  templateUrl: './administrative-status.component.html',
  styleUrls: ['./administrative-status.component.scss']
})
export class AdministrativeStatusComponent implements OnChanges {
  @Input() status: string;
  status$: any;

  constructor(
    private metadataService: MetadataService
  ) { }

  ngOnChanges() {
    this.status$ = this.metadataService.getRange('MX.adminStatusEnum')
      .pipe(map((result: any[]) => result.find(r => r.id === this.status)));
  }

}
