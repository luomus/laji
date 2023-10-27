import { ApplicationRef, createComponent, Inject, Injectable, Renderer2, RendererFactory2, TemplateRef, Type } from '@angular/core';
import { ModalComponent, ModalSize } from './modal/modal.component';
import { DOCUMENT } from '@angular/common';

interface ModalOptions<T> {
  /**
   * One of 'sm', 'md', 'lg', 'xl'. Defaults to 'md'
   */
  size?: ModalSize;
  contentClass?: string;
  noClose?: boolean;
  /**
   * Content component's initial state
   */
  initialState?: Partial<T>;
}

export type ModalRef<T = any>  = ModalComponent & { content?: T };

@Injectable({providedIn: 'root'})
export class ModalService {

  private renderer: Renderer2;
  private modal: ModalRef<any>;

  constructor(
    private appRef: ApplicationRef,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  show<T>(componentClassOrTemplateRef: Type<T> | TemplateRef<T>, options?: ModalOptions<T>): ModalRef<T> {
    const modalComponent = this.showModalInBody(options);
    const contentNode = modalComponent.instance.getContentNode();
    const contentHostNode = document.createElement('div');
    this.renderer.appendChild(contentNode, contentHostNode);
    this.modal = modalComponent.instance as any;
    if (componentClassOrTemplateRef instanceof TemplateRef) {
      this.injectTemplate(componentClassOrTemplateRef, contentNode);
    } else  {
      this.injectComponent(componentClassOrTemplateRef, contentNode, options);
    }

    return this.modal as ModalRef<T>;
  }

  private showModalInBody<T>(options: ModalOptions<T> = {}) {
    const modalComponent = createComponent(ModalComponent, { environmentInjector: this.appRef.injector });
    this.appRef.attachView(modalComponent.hostView);
    this.renderer.appendChild(document.body, modalComponent.location.nativeElement);
    Object.keys(options).forEach(option => {
      modalComponent.instance[option] = options[option];
    });
    modalComponent.instance.show();
    modalComponent.changeDetectorRef.detectChanges();
    modalComponent.instance.onHide.subscribe(this.destroyOnHide.bind(this));
    return modalComponent;
  }

  private injectTemplate<T>(templateRef: TemplateRef<T>, contentNode: HTMLElement) {
    const embeddedViewRef = templateRef.createEmbeddedView(templateRef as any);
    embeddedViewRef.rootNodes.forEach(node => {
      this.renderer.appendChild(contentNode, node);
    });
    embeddedViewRef.detectChanges();
    this.appRef.attachView(embeddedViewRef);
  }

  private injectComponent<T>(componentClass: Type<T>, contentNode: HTMLElement, options: ModalOptions<T> = {}) {
    const contentComponent = createComponent<T>((componentClass as any), {
      environmentInjector: this.appRef.injector,
    });
    this.renderer.appendChild(contentNode, contentComponent.location.nativeElement);

    Object.keys((options.initialState || {})).forEach(option => {
      contentComponent.instance[option] = options.initialState[option];
    });
    contentComponent.changeDetectorRef.detectChanges();
    this.appRef.attachView(contentComponent.hostView);
    (this.modal as any).content = contentComponent.instance;
  }

  hide() {
    this.modal.hide();
  }

  destroyOnHide() {
    this.renderer.removeChild(document.body, (this.modal as any).elementRef.nativeElement);
  }
}
