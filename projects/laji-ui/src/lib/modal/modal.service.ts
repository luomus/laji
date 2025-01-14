import { ApplicationRef, ComponentRef, createComponent, EmbeddedViewRef, Inject, Injectable, Renderer2, RendererFactory2, TemplateRef, Type } from '@angular/core';
import { ModalComponent, ModalSize } from './modal/modal.component';
import { DOCUMENT } from '@angular/common';

interface ModalOptions<T> {
  /** One of 'sm', 'md', 'lg', 'xl'. Defaults to 'md' */
  size?: ModalSize;
  contentClass?: string;
  noClose?: boolean;

  /** Content component's initial state */
  initialState?: Partial<T>;
}

export type ModalRef<T = any> = ModalComponent & { content?: T };

@Injectable({providedIn: 'root'})
export class ModalService {

  private renderer: Renderer2;

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
    const contentHostNode = this.document.createElement('div');
    this.renderer.appendChild(contentNode, contentHostNode);

    const modal = modalComponent.instance as ModalRef<EmbeddedViewRef<T> | ComponentRef<T>>;
    let content: EmbeddedViewRef<T> | ComponentRef<T>;
    if (componentClassOrTemplateRef instanceof TemplateRef) {
      content = this.injectTemplate(componentClassOrTemplateRef, contentNode);
    } else  {
       content = this.injectComponent(componentClassOrTemplateRef as Type<T>, contentNode, options);
    }
    // Make content accessible for destroyOnHide() through modalComponent.
    (modalComponent as any).contentRef = content;

    // Make content accessible for client using this service.
    (modal as any).content = (content as any).instance;

    modal.onHide.subscribe(() => this.destroyOnHide(modalComponent));
    return modal as ModalRef<T>;
  }

  private showModalInBody<T>(options: ModalOptions<T> = {}) {
    const modalComponent = createComponent(ModalComponent, { environmentInjector: this.appRef.injector });
    this.appRef.attachView(modalComponent.hostView);
    this.renderer.appendChild(this.document.body, modalComponent.location.nativeElement);
    (Object.keys(options) as (keyof ModalOptions<T>)[]).forEach(option => {
      (modalComponent.instance as any)[option] = options[option];
    });
    modalComponent.instance.show();
    modalComponent.changeDetectorRef.detectChanges();
    return modalComponent;
  }

  private injectTemplate<T>(templateRef: TemplateRef<T>, contentNode: HTMLElement) {
    const embeddedView = templateRef.createEmbeddedView(templateRef as any);
    embeddedView.rootNodes.forEach(node => {
      this.renderer.appendChild(contentNode, node);
    });
    embeddedView.detectChanges();
    this.appRef.attachView(embeddedView);
    return embeddedView;
  }

  private injectComponent<T>(componentClass: Type<T>, contentNode: HTMLElement, options: ModalOptions<T> = {}) {
    const contentComponent = createComponent<T>((componentClass as any), {
      environmentInjector: this.appRef.injector,
    });
    this.renderer.appendChild(contentNode, contentComponent.location.nativeElement);

    (Object.keys(options.initialState || {}) as (keyof T)[]).forEach(option => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (contentComponent.instance as any)[option] = options.initialState![option];
    });
    contentComponent.changeDetectorRef.detectChanges();
    this.appRef.attachView(contentComponent.hostView);
    return contentComponent;
  }

  destroyOnHide(modalComponent: ComponentRef<ModalComponent>) {
    (modalComponent as any).contentRef.destroy();
    modalComponent.destroy();
    this.renderer.removeChild(this.document.body, modalComponent.instance.elementRef.nativeElement);
  }
}
