import { Component } from '@angular/core';
import { Global } from '../../environments/global';

@Component({
    selector: 'laji-theme',
    templateUrl: './theme.component.html',
    styleUrls: ['./theme.component.scss'],
    standalone: false
})
export class ThemeComponent {

  Global = Global; // eslint-disable-line @typescript-eslint/naming-convention

}
