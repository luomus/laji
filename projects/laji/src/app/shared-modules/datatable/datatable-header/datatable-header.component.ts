import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DownloadComponent } from '../../download-modal/download.component';

@Component({
  selector: 'laji-datatable-header',
  templateUrl: './datatable-header.component.html',
  styleUrls: ['./datatable-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableHeaderComponent {

  @ViewChild(DownloadComponent, {static: false}) downloadComponent?: DownloadComponent;

  @Input() showSettingsMenu = false;
  @Input() showDownloadMenu? = false;
  @Input() downloadLoading = false;
  @Input() maxDownload = 0;
  @Input() count = 0;
  @Input() downloadText = 'Download';
  @Input() showBrowseObservationsButton = false;
  @Input() browseObservationsText = 'Browse observations';

  @Output() browseObservations = new EventEmitter<void>();
  @Output() openSettingsMenu = new EventEmitter<void>();
  @Output() download = new EventEmitter<string>();

}
