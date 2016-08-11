import {DomSanitizationService, SafeHtml} from "@angular/platform-browser";
import {PipeTransform, Pipe} from "@angular/core";

/**
 * Marks the sting safe for rendering
 * This should newer be used on user inputted values!
 * Usage:
 *  [innerHtml]="value | htmlAsIs"
 */
@Pipe({
  name: 'htmlAsIs'
})
export class HtmlAsIs implements PipeTransform  {
  constructor(private _sanitizer: DomSanitizationService){}

  transform(v: string) : SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}
