import { Injectable, ElementRef, RendererFactory2, Inject, PLATFORM_ID, NgZone, Renderer2 } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { positionElements } from './ng-positioning';

import { fromEvent, merge, of, animationFrameScheduler, Subject, Observable } from 'rxjs';
import { Options } from './models';
import { Placement, PlacementService } from '../../placement/placement.service';


export interface PositioningOptions {
  /** The DOM element, ElementRef, or a selector string of an element which will be moved */
  element?: HTMLElement | ElementRef | string;

  /** The DOM element, ElementRef, or a selector string of an element which the element will be attached to  */
  target?: HTMLElement | ElementRef | string;

  /**
   * A string of the form 'vert-attachment horiz-attachment' or 'placement'
   * - placement can be "top", "bottom", "left", "right"
   * not yet supported:
   * - vert-attachment can be any of 'top', 'middle', 'bottom'
   * - horiz-attachment can be any of 'left', 'center', 'right'
   */
  attachment?: string;

  /** A string similar to `attachment`. The one difference is that, if it's not provided,
   * `targetAttachment` will assume the mirror image of `attachment`.
   */
  targetAttachment?: string;

  /** A string of the form 'vert-offset horiz-offset'
   * - vert-offset and horiz-offset can be of the form "20px" or "55%"
   */
  offset?: string;

  /** A string similar to `offset`, but referring to the offset of the target */
  targetOffset?: string;

  /** If true component will be attached to body */
  appendToBody?: boolean;
}

const attachmentToLajiUiPlacement = (attachment: string): Placement => {
  const [vert, horiz] = attachment.split(' ');
  return vert === 'top'
    ? 'top'
    : vert === 'bottom' || !horiz
      ? 'bottom'
      : horiz === 'left'
        ? 'left'
        : 'right';
};

@Injectable({providedIn: 'root'})
export class PositioningService {
  private options?: Options;
  private update$$ = new Subject<null>();
  private positionElements = new Map<HTMLElement, PositioningOptions>();
  private triggerEvent$?: Observable<number|Event|null>;
  private isDisabled = false;

  constructor(
    ngZone: NgZone,
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) platformId: number,
    private placementService: PlacementService,
    @Inject(DOCUMENT) private document: Document
  ) {

    if (isPlatformBrowser(platformId)) {
      ngZone.runOutsideAngular(() => {
        this.triggerEvent$ = merge(
          fromEvent(window, 'scroll', { passive: true }),
          fromEvent(window, 'resize', { passive: true }),
                    of(0, animationFrameScheduler),
          this.update$$
        );

        this.triggerEvent$.subscribe(() => {
          if (this.isDisabled) {
            return;
          }

          for (let el of this.positionElements.keys()) {
            this.placementService.update(el);
          }
        });
      });
    }
  }

  position(options: PositioningOptions, renderer: Renderer2): void {
    this.addPositionElement(options, renderer);
  }

  get event$(): Observable<number|Event|null>|undefined {
    return this.triggerEvent$;
  }

  disable(): void {
    this.isDisabled = true;
  }

  enable(): void {
    this.isDisabled = false;
  }

  addPositionElement(options: PositioningOptions, renderer: Renderer2): void {
    if (!options.element) { console.warn('Positioning service: expected element to exist'); return; }
    if (!options.target) { console.warn('Positioning service: expected target to exist'); return; }
    if (typeof options.element === 'string') { console.warn('Positioning service: expected element not to be string'); return; }
    if (typeof options.target === 'string') { console.warn('Positioning service: expected element not to be string'); return; }
    const element: HTMLElement = (options.element as any)?.['nativeElement'] as HTMLElement ?? options.element;
    const target: HTMLElement = (options.target as any)?.['nativeElement'] as HTMLElement?? options.target;
    this.placementService.attach(element, target, attachmentToLajiUiPlacement(options.attachment!), {window, document: this.document, renderer: renderer})
    this.positionElements.set(_getHtmlElement(options.element)!, options);
  }

  calcPosition(): void {
    this.update$$.next(null);
  }

  deletePositionElement(elRef: ElementRef): void {
    this.placementService.detach(elRef.nativeElement);
    this.positionElements.delete(_getHtmlElement(elRef)!);
  }

  setOptions(options: Options) {
    this.options = options;
  }
}

function _getHtmlElement(element?: HTMLElement | ElementRef | string): HTMLElement | null {
  // it means that we got a selector
  if (typeof element === 'string') {
    return document.querySelector(element);
  }

  if (element instanceof ElementRef) {
    return element.nativeElement;
  }

  return element ?? null;
}
