import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-datatable-header',
  templateUrl: './datatable-header.component.html',
  styleUrls: ['./datatable-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableHeaderComponent {

  @Input() showSettingsMenu = false;
  @Input() showDownloadMenu = false;
  @Input() downloadLoading = false;
  @Input() maxDownload = false;
  @Input() count = false;
  @Input() downloadText = 'Download';

  @Output() openSettingsMenu = new EventEmitter<void>();
  @Output() download = new EventEmitter<string>();

}
