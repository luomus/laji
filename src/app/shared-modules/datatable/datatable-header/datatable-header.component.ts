import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-datatable-header',
  templateUrl: './datatable-header.component.html',
  styleUrls: ['./datatable-header.component.scss']
})
export class DatatableHeaderComponent implements OnInit {

  @Input() showSettingsMenu = false;
  @Input() showDownloadMenu = false;
  @Input() downloadLoading = false;
  @Input() maxDownload = false;
  @Input() count = false;

  @Output() openSettingsMenu = new EventEmitter<void>();
  @Output() download = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}
