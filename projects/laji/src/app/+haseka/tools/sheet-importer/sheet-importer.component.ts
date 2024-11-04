import { Component, ViewChild } from '@angular/core';
import { ImporterComponent } from '../../../shared-modules/spreadsheet/importer/importer.component';
import { ImportService } from '../../../shared-modules/spreadsheet/service/import.service';

@Component({
  selector: 'laji-sheet-importer',
  templateUrl: './sheet-importer.component.html',
  styleUrls: ['./sheet-importer.component.scss']
})
export class SheetImporterComponent {
  @ViewChild(ImporterComponent) importerComponent: ImporterComponent;

  maxUnitsPerDocument = ImportService.maxPerDocument;

  canDeactivate() {
    return this.importerComponent
      ? this.importerComponent.canDeactivate()
      : true;
  }
}
