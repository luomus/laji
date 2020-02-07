import { Component, OnInit } from '@angular/core';
import { ImportService } from '../service/import.service';

@Component({
  selector: 'laji-import-container',
  template: `
    <h3>
      {{ 'excel.import' | translate }}
    </h3>
    <div class="row">
      <div class="col-sm-12">
        <p>
          {{ 'excel.import.intro' | translate:{maxUnits: maxUnits} }}
        </p>
      </div>
    </div>
    <laji-importer></laji-importer>
  `,
  styles: []
})
export class ImportContainerComponent implements OnInit {


  maxUnits = ImportService.maxPerDocument;

  ngOnInit() {
  }

}
