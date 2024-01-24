import { Injectable, Renderer2 } from '@angular/core';

interface Placement {
  x: 'left' | 'right';
  y: 'top' | 'bottom';
};

interface AttachedElement {
  element: HTMLElement;
  target: HTMLElement;
  placement: Placement;
  mutationObserver: MutationObserver;
  resizeObserver: ResizeObserver;
}

const getAbsoluteOffset = (d: Document, w: Window, el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const scrollX = w.scrollX || d.documentElement.scrollLeft;
  const scrollY = w.scrollY  || d.documentElement.scrollTop;
  const x = rect.left + scrollX;
  const y = rect.top + scrollY;
  return { x, y };
};

@Injectable()
export class PlacementService {
  private nextElementId = 0;
  private attachedElements: Record<string, AttachedElement> = {};

  constructor(private renderer: Renderer2, private window: Window, private document: Document) {}

  /**
  * Places the element in the document body relative to the target element
  * Assumes that the element is not attached to any parent in DOM
  */
  attach(element: HTMLElement, target: HTMLElement, placement: Placement) {
    this.renderer.appendChild(this.document.body, element);

    // assign an unique identifier for each element
    const id = this.nextElementId+'';
    this.nextElementId++;
    if (this.nextElementId === Number.MAX_SAFE_INTEGER) {
      this.nextElementId = 0;
    }
    this.renderer.setAttribute(element, 'data-placement-service-id', id);

    const mutationObserver = new MutationObserver(_ => {
      this.place(element, target, placement);
    });
    mutationObserver.observe(target, { attributes: true, childList: true, subtree: true });
    const resizeObserver = new ResizeObserver(_ => {
      this.place(element, target, placement);
    });
    resizeObserver.observe(element);
    resizeObserver.observe(target);

    this.attachedElements[id] = {
      element, target, placement, mutationObserver, resizeObserver
    }

    this.place(element, target, placement);
  }

  /**
  * Updates the placement of an element relative to its target. Note that not all
  * renderer changes can be easily tracked. Use this if the position of the target
  * element has changed, but the placement of the element did not automatically update.
  */
  update(element: HTMLElement) {
    const id = element.getAttribute('data-placement-service-id');
    if (!id || !this.attachedElements[id]) {
      console.warn('PlacementService attempted to update an unattached element.')
      return;
    }
    const a = this.attachedElements[id];
    this.place(a.element, a.target, a.placement);
  }

  detach(element: HTMLElement, target: HTMLElement) {
    const id = element.getAttribute('data-placement-service-id');
    if (!id || !this.attachedElements[id]) {
      console.warn('PlacementService attempted to detach an unattached element.')
      return;
    }
    const a = this.attachedElements[id];
    a.resizeObserver.disconnect();
    a.mutationObserver.disconnect();
    delete this.attachedElements[id];
  }

  private place(element: HTMLElement, target: HTMLElement, placement: Placement) {
    const elementRect = element.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const {x: targetX, y: targetY} = getAbsoluteOffset(this.document, this.window, target);

    const x = placement.x === 'left'
      ? Math.min(targetX, this.window.innerWidth - elementRect.width)
      : Math.min(targetX + targetRect.width, this.window.innerWidth - elementRect.width);

    const y = placement.y === 'top'
      ? Math.max(targetY - elementRect.height, 0)
      : Math.min(targetY + targetRect.height, this.window.innerHeight- elementRect.height);

    this.renderer.setStyle(element, 'transform', `translate(${x}px, ${y}px)`);
  }
}

