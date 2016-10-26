import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { PipeTransform, Pipe } from '@angular/core';

/**
 * Marks the sting safe for rendering
 * This should never be used on user inputted values!!!
 *
 * Usage:
 *  [innerHtml]="value | safe:html"
 */
@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) {
  }

  transform(value: string, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        return this._sanitizer.bypassSecurityTrustHtml(value);
      case 'style':
        return this._sanitizer.bypassSecurityTrustStyle(value);
      case 'script':
        return this._sanitizer.bypassSecurityTrustScript(value);
      case 'url':
        console.log('SAFE URL', value);
        return this._sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl':
        return this._sanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        throw new Error(`Unable to bypass security for invalid type: ${type}`);
    }
  }
}
