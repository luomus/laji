import { AfterViewInit, Directive, Input, TemplateRef, ViewContainerRef, EmbeddedViewRef,
        ElementRef, Renderer2, ComponentRef, OnDestroy, Injector, EnvironmentInjector, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { PopoverContainerComponent } from './popover-container.component';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime, filter } from 'rxjs/operators';
import { Placement, PlacementService } from '../placement/placement.service';

export type PopoverMode = 'hover' | 'click' | 'disabled';
export type PopoverRootElement = 'component' | 'body';

@Directive({
  selector: '[luPopover]'
})
export class PopoverDirective implements AfterViewInit, OnDestroy {
  @Input() luPopover!: TemplateRef<null>;
  @Input() popoverTitle = '';
  @Input() placement: Placement = 'bottom';
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
  private hoveringSubscription?: Subscription;
  private hoveringComponent = false;
  private hoveringPopover = false;
  private componentListenerDestructors: (() => void)[] = [];
  private popoverListenerDestructors: (() => void)[] = [];
  private closeSubscription?: Subscription;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    private envInjector: EnvironmentInjector,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    private placementService: PlacementService
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
      hovering => hovering ? this.loadContainer() : this.unloadContainer()
    );
  }

  ngOnDestroy(): void {
    this.unloadContainer();
    this.componentListenerDestructors.forEach(d => d());
    this.popoverListenerDestructors.forEach(d => d());
    this.hoveringSubscription?.unsubscribe();
    this.closeSubscription?.unsubscribe();
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
    const hovering = { mouseenter: true, mouseleave: false }[state];
    if (target === 'component') {
      this.hoveringComponent = hovering;
    } else {
      this.hoveringPopover = hovering;
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
    if (this.mode === 'click') {
      this.popoverRef.instance.displayCloseBtn = true;
      this.closeSubscription = this.popoverRef.instance.closePopover.subscribe(() => this.unloadContainer());
    }
    this.renderer.addClass(this.popoverRef.location.nativeElement, `root-element-${this.rootElement}`);
    this.renderer.addClass(this.popoverRef.location.nativeElement, this.placement);

    if (this.rootElement === 'body') {
      this.placementService.attach(
        this.popoverRef.location.nativeElement, this.el.nativeElement,
        this.placement, { renderer: this.renderer, window, document: this.document }
      );
    } else {
      this.renderer.appendChild(this.el.nativeElement, this.popoverRef.location.nativeElement);
    }

    this.cdr.detectChanges();
  }

  private unloadContainer() {
    if (this.popoverRef) {
      if (this.rootElement === 'body') {
        this.placementService.detach(this.popoverRef.location.nativeElement);
      }
      this.popoverRef.destroy();
      this.popoverRef = undefined;
    }
    this.projectedContentRef?.destroy(); this.projectedContentRef = undefined;
    this.popoverListenerDestructors.forEach(d => d());
  }
}
