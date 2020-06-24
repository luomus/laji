import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

export interface ViewModel {
  showLabelDesigner: boolean;
  formID: string;
}

@Component({
  selector: 'laji-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {

  vm: ViewModel;

  static getData(route: ActivatedRouteSnapshot) {
    return route
      ? route.data?.tools || this.getData(route.parent)
      : {};
  }

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.vm = ToolsComponent.getData(this.route.snapshot);
  }

}
