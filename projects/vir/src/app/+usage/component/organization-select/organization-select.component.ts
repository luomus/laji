import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'vir-organization-select',
  templateUrl: './organization-select.component.html',
  styleUrls: ['./organization-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSelectComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
