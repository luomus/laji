import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostBinding, HostListener, Inject } from '@angular/core';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';

/**
 * Makes the target element to be show a dropdown menu on click.
 *
 * The dropdown menu must be a sibling element with `luDropdownMenu` attribute.
 *
 * The menu will close when any element on the document is clicked. To exclude an element click from closing them menu,
 * use the attribute `luDropdownNoClose` on it.
 */
@Directive({
  selector: '[luDropdownToggle]'
})
export class DropdownToggleDirective {

  @HostBinding('attr.role') elementRole = 'button';
  @HostBinding('attr.aria-haspopup') elementAriaHasPopup = 'true';

  constructor(
    private elementRef: ElementRef,
    private platformService: PlatformService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  @HostListener('click', ['$event'])
  onClick() {
    const dropdownMenuElement = this.getMenuElement();

    const isDisplayed = dropdownMenuElement.style.display !== 'none';
    dropdownMenuElement.style.display = isDisplayed ? 'none' : 'block';
    this.dispatchResizeEvent();
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement) {
    const menu = this.getMenuElement();
    if (menu.style.display === 'none') {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(target);

    let iteratedElem: HTMLElement | null = target;
    while (iteratedElem && iteratedElem !== this.document.body) {
      if (iteratedElem.hasAttribute('luDropdownNoClose')) {
        return;
      }
      iteratedElem = iteratedElem.parentElement;
    }
    if (!clickedInside) {
      menu.style.display = 'none';
    }
    this.dispatchResizeEvent();
  }

  private dispatchResizeEvent() {
      try {
        this.platformService.window.dispatchEvent(new Event('resize'));
      } catch (e) {
        try {
          const evt: any = this.platformService.window.document.createEvent('UIEvents');
          evt.initUIEvent('resize', true, false, this.platformService.window, 0);
          this.platformService.window.dispatchEvent(evt);
        } catch (error) {}
      }
  }

  /**
   * Get the element with luDropdownMenu attribute. Throws error if not found.
   */
  private getMenuElement(): HTMLElement {
    const siblings: HTMLCollection = this.elementRef.nativeElement.parentElement.children;
    const menuElement = Array.from(siblings).find(
      (e) => e.hasAttribute('luDropdownMenu')
    ) as HTMLElement;
    if (!menuElement) {
      // eslint-disable-next-line max-len
      throw new Error('No dropdown menu found for dropdownToggle to target. Assign `luDropdownMenu` directive to the menu element. It must be a sibling element of `luDropdownToggle`.');
    }
    return menuElement;
  }
}
