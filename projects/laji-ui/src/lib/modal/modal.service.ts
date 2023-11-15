import { ApplicationRef, ComponentRef, createComponent, EmbeddedViewRef, Inject, Injectable, Renderer2, RendererFactory2, TemplateRef, Type } from '@angular/core';
import { ModalComponent, ModalSize } from './modal/modal.component';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

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
  private modal?: ModalRef<any>;
  private modalComponent?: ComponentRef<ModalComponent>;
  private content?: ComponentRef<any> | EmbeddedViewRef<any>;

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
    this.modalComponent = modalComponent;
    if (componentClassOrTemplateRef instanceof TemplateRef) {
      this.content = this.injectTemplate(componentClassOrTemplateRef, contentNode);
    } else  {
      this.content = this.injectComponent(componentClassOrTemplateRef, contentNode, options);
    }

    return this.modal as ModalRef<T>;
  }

  private modalHideSub: Subscription;

  private showModalInBody<T>(options: ModalOptions<T> = {}) {
    const modalComponent = createComponent(ModalComponent, { environmentInjector: this.appRef.injector });
    this.appRef.attachView(modalComponent.hostView);
    this.renderer.appendChild(document.body, modalComponent.location.nativeElement);
    Object.keys(options).forEach(option => {
      modalComponent.instance[option] = options[option];
    });
    modalComponent.instance.show();
    modalComponent.changeDetectorRef.detectChanges();
    this.modalHideSub?.unsubscribe();
    this.modalHideSub = modalComponent.instance.onHide.subscribe(this.destroyOnHide.bind(this));
    return modalComponent;
  }

  private injectTemplate<T>(templateRef: TemplateRef<T>, contentNode: HTMLElement) {
    const embeddedView= templateRef.createEmbeddedView(templateRef as any);
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

    Object.keys((options.initialState || {})).forEach(option => {
      contentComponent.instance[option] = options.initialState[option];
    });
    contentComponent.changeDetectorRef.detectChanges();
    this.appRef.attachView(contentComponent.hostView);
    (this.modal as any).content = contentComponent.instance;
    return contentComponent;
  }

  hide() {
    this.modal.hide();
  }

  destroyOnHide() {
    this.modalComponent.destroy();
    this.modalComponent = undefined;
    this.content.destroy();
    this.content = undefined;
    this.renderer.removeChild(document.body, (this.modal as any).elementRef.nativeElement);
    this.modal = undefined;
  }
}
