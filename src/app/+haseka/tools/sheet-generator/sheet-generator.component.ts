import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToolsComponent, ViewModel } from '../tools.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'laji-sheet-generator',
  templateUrl: './sheet-generator.component.html',
  styleUrls: ['./sheet-generator.component.scss']
})
export class SheetGeneratorComponent implements OnInit {
  vm: ViewModel;
  importableForms = environment.massForms;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.vm = ToolsComponent.getData(this.route.snapshot);
  }
}
