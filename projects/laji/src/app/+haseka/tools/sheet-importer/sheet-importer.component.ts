import { Component } from '@angular/core';
import { ImportService } from '../../../shared-modules/spreadsheet/service/import.service';

@Component({
  selector: 'laji-sheet-importer',
  templateUrl: './sheet-importer.component.html',
  styleUrls: ['./sheet-importer.component.scss']
})
export class SheetImporterComponent {
  maxUnitsPerDocument = ImportService.maxPerDocument;
}
