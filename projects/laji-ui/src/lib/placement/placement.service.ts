import { Injectable, Renderer2 } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

export type Placement = 'top' | 'bottom' | 'left' | 'right';

interface RenderingContext {
  renderer: Renderer2;
  window: Window;
  document: Document;
}

interface AttachedElement {
  element: HTMLElement;
  target: HTMLElement;
  placement: Placement;
  mutationObserver: MutationObserver;
  resizeObserver: ResizeObserver;
  change$: Subject<void>;
  renderingContext: RenderingContext;
}

const getAbsoluteOffset = (d: Document, w: Window, el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const scrollX = w.scrollX || d.documentElement.scrollLeft;
  const scrollY = w.scrollY  || d.documentElement.scrollTop;
  const x = rect.left + scrollX;
  const y = rect.top + scrollY;
  return { x, y };
};

const addScrollListenerToAllParents = (target: HTMLElement, { renderer, document }: RenderingContext, cb: () => void): (() => void)[] => {
  const destructors: (() => void)[] = [];
  let currentNode = <ParentNode>target;
  while (currentNode !== document.body && currentNode !== null) {
    destructors.push(renderer.listen(currentNode, 'scroll', () => cb()));
    currentNode = renderer.parentNode(currentNode);
  }
  return destructors;
};

@Injectable({ providedIn: 'root' })
export class PlacementService {
  private nextElementId = 0;
  private attachedElements: Record<string, AttachedElement> = {};

  constructor() {}

  /**
   * Places the element in the document body relative to the target element
   * Assumes that the element is not attached to any parent in DOM
   */
  attach(element: HTMLElement, target: HTMLElement, placement: Placement, renderingContext: RenderingContext) {
    renderingContext.renderer.appendChild(renderingContext.document.body, element);

    // assign a unique identifier for each element
    const id = this.nextElementId+'';
    this.nextElementId++;
    if (this.nextElementId === Number.MAX_SAFE_INTEGER) {
      this.nextElementId = 0;
    }
    renderingContext.renderer.setAttribute(element, 'data-placement-service-id', id);

    const change$ = new Subject<void>();
    const mutationObserver = new MutationObserver(_ => change$.next());
    const resizeObserver = new ResizeObserver(_ => change$.next());

    const attached: AttachedElement = { element, target, placement, mutationObserver, resizeObserver, change$, renderingContext };
    this.attachedElements[id] = attached;

    const destructors = addScrollListenerToAllParents(target, renderingContext, () => change$.next());
    // unsubscribe unnecessary, because scrolled completes on detach
    change$.pipe(
      // because we are listening to all the parents at once, multiple scroll events
      // might occur during a single event loop iteration. 0ms throttle should help
      // with this, although I didn't test the difference in practice.
      throttleTime(0)
    ).subscribe(
      () => this.place(attached),
      e => { throw e; },
      () => destructors.forEach(d => d())
    );

    mutationObserver.observe(element, { attributes: true, childList: true, subtree: true });
    mutationObserver.observe(target, { attributes: true, childList: true, subtree: true });
    resizeObserver.observe(element);
    resizeObserver.observe(target);

    requestAnimationFrame(() => {
      change$.next();
    });
  }

  /**
   * Updates the placement of an element relative to its target. Note that not all
   * renderer changes can be easily tracked. Use this if the position of the target
   * element has changed, but the placement of the element did not automatically update.
   */
  update(element: HTMLElement) {
    const id = element.getAttribute('data-placement-service-id');
    if (!id || !this.attachedElements[id]) {
      console.warn('PlacementService attempted to update an unattached element.');
      return;
    }
    this.place(this.attachedElements[id]);
  }

  /**
   * Not detaching on component destroy causes a memory leak.
   */
  detach(element: HTMLElement) {
    const id = element.getAttribute('data-placement-service-id');
    if (!id || !this.attachedElements[id]) {
      console.warn('PlacementService attempted to detach an unattached element.');
      return;
    }
    const attached = this.attachedElements[id];
    attached.resizeObserver.disconnect();
    attached.mutationObserver.disconnect();
    attached.change$.complete();
    delete this.attachedElements[id];
  }

  private place({ element, target, renderingContext: { renderer, window, document }, placement }: AttachedElement) {
    const elementRect = element.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const {x: targetX, y: targetY} = getAbsoluteOffset(document, window, target);

    let x = 0;
    let y = 0;
    let maxHeight = window.innerHeight;
    let maxWidth = window.innerWidth;

    // substracting scrollX corresponds to transforming x from document space to window space
    switch (placement) {
      case 'left':
        x = Math.max(targetX - elementRect.width, 0);
        y = Math.min(targetY, window.innerHeight - elementRect.height);
        maxHeight = window.innerHeight;
        maxWidth = x - window.scrollX;
        break;
      case 'right':
        x = targetX + targetRect.width;
        y = Math.min(targetY, window.innerHeight - elementRect.height);
        maxHeight = window.innerHeight;
        maxWidth = window.innerWidth - (x - window.scrollX);
        break;
      case 'top':
        x = Math.min(targetX, window.innerWidth - elementRect.width);
        y = Math.max(targetY - elementRect.height, 0);
        maxHeight = targetY - window.scrollY;
        maxWidth = window.innerWidth;
        break;
      case 'bottom':
      default:
        x = Math.min(targetX, window.innerWidth - elementRect.width);
        y = targetY + targetRect.height;
        maxHeight = window.innerHeight - (y - window.scrollY);
        maxWidth = window.innerWidth;
        break;
    }

    renderer.setStyle(element, 'transform', `translate(${x}px, ${y}px)`);

    requestAnimationFrame(() => {
      renderer.setStyle(element, 'max-height', `${maxHeight}px`);
      renderer.setStyle(element, 'max-width', `${maxWidth}px`);
    });
  }
}

