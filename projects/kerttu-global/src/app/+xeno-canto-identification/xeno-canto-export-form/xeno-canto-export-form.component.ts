import { ChangeDetectionStrategy, Component, OnInit, output, signal } from '@angular/core';
import { IIdentificationHistoryQuery, XenoCantoAnnotationSet } from '../../kerttu-global-shared/models';
import { ColumnChangesService, DimensionsHelper, ScrollbarHelper } from '@achimha/ngx-datatable';

export interface XenoCantoExportFormResult {
  annotationSet: XenoCantoAnnotationSet;
}

@Component({
    selector: 'bsg-xeno-canto-export-form',
    templateUrl: './xeno-canto-export-form.component.html',
    styleUrls: ['./xeno-canto-export-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
    providers: [ScrollbarHelper, DimensionsHelper, ColumnChangesService]
})
export class XenoCantoExportFormComponent implements OnInit {
  siteId?: number;
  loading = signal(false);

  annotationSet: XenoCantoAnnotationSet = { setName: '', setRemarks: '' };

  totalAnnotations = 0;
  totalBoxCount = 0;

  query: IIdentificationHistoryQuery = {};

  submitForm = output<XenoCantoExportFormResult>();

  ngOnInit() {
    this.updateQuery();
  }

  onTotalChange(total: number) {
    this.totalAnnotations = total;
  }

  onTotalBoxCountChange(totalBoxCount: number) {
    this.totalBoxCount = totalBoxCount;
  }

  onSubmit() {
    this.submitForm.emit({
      annotationSet: this.annotationSet
    });
  }

  private updateQuery() {
    this.query = {
      page: 1,
      includeSkipped: false,
      hasBoxes: true,
      site: this.siteId
    };
  }
}
