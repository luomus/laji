import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'laji-tool-success',
    templateUrl: './tool-success.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ToolSuccessComponent {

  @Input() success = false;

}
