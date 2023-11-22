import { Directive, HostBinding } from '@angular/core';

/**
 * Makes the target element to be shown as dropdown menu content.
 *
 * The dropdown toggle button must be a sibling element with `luDropdownToggle` attribute.
 *
 * To make the dropdown menu position to the right instead of left, give it `.right` CSS class.
 *
 * The menu will close when any element on the document is clicked. To exclude an element click from closing them menu,
 * use the attribute `luDropdownNoClose` on it.
 */
@Directive({
  selector: '[luDropdownMenu]'
})
export class DropdownMenuDirective {

  @HostBinding('style.display') elementDisplay = 'none';
  @HostBinding('style.position') elementPosition = 'absolute';
  @HostBinding('class') elementClass = 'lu-dropdown';
  @HostBinding('attr.role') elementRole = 'menu';

}
