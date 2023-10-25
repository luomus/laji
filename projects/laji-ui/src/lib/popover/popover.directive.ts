import { AfterViewInit, Directive, Input, TemplateRef, ViewContainerRef, EmbeddedViewRef,
        ElementRef, Renderer2, ComponentRef, OnDestroy, Injector, EnvironmentInjector, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { PopoverContainerComponent } from './popover-container.component';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime, filter } from 'rxjs/operators';

export type PopoverPlacement = 'left' | 'right' | 'top' | 'bottom';
export type PopoverMode = 'hover' | 'click' | 'disabled';
export type PopoverRootElement = 'component' | 'body';

const getAbsoluteOffset = (d: Document, w: Window, el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const scrollX = w.scrollX || d.documentElement.scrollLeft;
  const scrollY = w.scrollY  || d.documentElement.scrollTop;
  const x = rect.left + scrollX;
  const y = rect.top + scrollY;
  return { x, y };
};

const getPopoverBodyOffset = (d: Document, w: Window, el: HTMLElement, popover: HTMLElement, placement: PopoverPlacement) => {
  const {x, y} = getAbsoluteOffset(d, w, el);
  const elRect = el.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  if (placement === 'left') {
    return {x: x - popoverRect.width, y};
  } else if (placement === 'right') {
    return {x: x + elRect.width, y};
  } else if (placement === 'top') {
    return {x, y: y - popoverRect.height};
  } else { // bottom
    return {x, y: y + elRect.height};
  }
};

export const positionPopoverInBody = (
  popoverEl: any, relativeEl: any, document: Document,
  renderer: Renderer2, placement: PopoverPlacement
) => {
  renderer.appendChild(document.body, popoverEl);
  // temporarily hide until the element is moved to the correct location
  renderer.setStyle(popoverEl, 'opacity', '0');
  setTimeout(() => { // we need to let angular render before the popover gets sane width/height values
    const {x, y} = getPopoverBodyOffset(document, window, relativeEl, popoverEl, placement);
    renderer.setStyle(popoverEl, 'transform', `translate(${x}px, ${y}px)`);
    renderer.setStyle(popoverEl, 'opacity', '1');
  });
};

@Directive({
  selector: '[luPopover]'
})
export class PopoverDirective implements AfterViewInit, OnDestroy {
  @Input() luPopover: TemplateRef<null>;
  @Input() popoverTitle = '';
  @Input() placement: PopoverPlacement = 'bottom';
  /* Inserting the popover at body, rather than as a child of the
     component is necessary when the css stacking context is messy
     (and the popover would otherwise be obscured by other elements).
     Note that this is likely to break the component for screenreaders. */
  @Input() rootElement: PopoverRootElement = 'component';
  @Input() templateContext: any;
  @Input() mode: PopoverMode = 'hover';

  private projectedContentRef: EmbeddedViewRef<any> | undefined;
  private popoverRef: ComponentRef<PopoverContainerComponent> | undefined;

  private hovering$ = new BehaviorSubject<boolean>(false);
  private hoveringSubscription: Subscription;
  private hoveringComponent = false;
  private hoveringPopover = false;
  private componentListenerDestructors: (() => void)[] = [];
  private popoverListenerDestructors: (() => void)[] = [];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    private envInjector: EnvironmentInjector,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.componentListenerDestructors.push(
      this.renderer.listen(this.el.nativeElement, 'mouseenter', () => this.updateHoverState('mouseenter', 'component')),
      this.renderer.listen(this.el.nativeElement, 'mouseleave', () => this.updateHoverState('mouseleave', 'component'))
    );
    this.hoveringSubscription = this.hovering$.pipe(
      filter(() => this.mode === 'hover'),
      distinctUntilChanged(),
      debounceTime(10)
    ).subscribe(
      b => { if (b) { this.loadContainer(); } else { this.unloadContainer(); } }
    );
  }

  ngOnDestroy(): void {
    this.unloadContainer();
    this.componentListenerDestructors.forEach(d => d());
    this.popoverListenerDestructors.forEach(d => d());
    this.hoveringSubscription?.unsubscribe();
  }

  @HostListener('click')
  onClick() {
    if (this.mode !== 'click') { return; }
    if (this.popoverRef) { this.unloadContainer(); } else { this.loadContainer(); }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: any) {
    if (this.mode !== 'click' || !this.popoverRef) { return; }
    const clickedInside =
         this.popoverRef.location.nativeElement.contains(target)
      || this.el.nativeElement.contains(target);
    if (!clickedInside) {
      this.unloadContainer();
    }
  }

  private updateHoverState(state: 'mouseenter' | 'mouseleave', target: 'component' | 'popover') {
    const b = { mouseenter: true, mouseleave: false }[state];
    if (target === 'component') {
      this.hoveringComponent = b;
    } else {
      this.hoveringPopover = b;
    }
    this.hovering$.next(this.hoveringComponent || this.hoveringPopover);
  }

  private loadContainer() {
    if (this.popoverRef) { return; }
    this.projectedContentRef = this.viewContainerRef.createEmbeddedView(this.luPopover, this.templateContext, { injector: this.injector });
    this.popoverRef = this.viewContainerRef.createComponent(PopoverContainerComponent,
      {
        environmentInjector: this.envInjector,
        projectableNodes: [
          this.projectedContentRef.rootNodes
        ]
      }
    );
    this.popoverListenerDestructors.push(
      this.renderer.listen(this.popoverRef.location.nativeElement, 'mouseenter', () => this.updateHoverState('mouseenter', 'popover')),
      this.renderer.listen(this.popoverRef.location.nativeElement, 'mouseleave', () => this.updateHoverState('mouseleave', 'popover'))
    );

    this.popoverRef.instance.title = this.popoverTitle;
    this.renderer.addClass(this.popoverRef.location.nativeElement, `root-element-${this.rootElement}`);
    this.renderer.addClass(this.popoverRef.location.nativeElement, this.placement);

    if (this.rootElement === 'body') {
      positionPopoverInBody(
        this.popoverRef.location.nativeElement, this.el.nativeElement,
        this.document, this.renderer, this.placement
      );
    } else {
      this.renderer.appendChild(this.el.nativeElement, this.popoverRef.location.nativeElement);
    }

    this.cdr.detectChanges();
  }

  private unloadContainer() {
    this.popoverRef?.destroy(); this.popoverRef = undefined;
    this.projectedContentRef?.destroy(); this.projectedContentRef = undefined;
    this.popoverListenerDestructors.forEach(d => d());
  }
}
