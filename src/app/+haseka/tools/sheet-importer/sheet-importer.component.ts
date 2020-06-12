import { Component, OnInit } from '@angular/core';
import { ImportService } from '../../../shared-modules/spreadsheet/service/import.service';
import { ToolsComponent, ViewModel } from '../tools.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'laji-sheet-importer',
  templateUrl: './sheet-importer.component.html',
  styleUrls: ['./sheet-importer.component.scss']
})
export class SheetImporterComponent implements OnInit {
  maxUnitsPerDocument = ImportService.maxPerDocument;

  vm: ViewModel;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.vm = ToolsComponent.getData(this.route.snapshot);
  }
}
