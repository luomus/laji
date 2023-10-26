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
  constructor(
    private appRef: ApplicationRef,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  private modal: ModalRef<any>;

  show<T>(componentClass: Type<T> | TemplateRef<T>, options: ModalOptions<T> = {}): ModalRef<T> {
    const modalComponent = createComponent(ModalComponent, { environmentInjector: this.appRef.injector });
    this.appRef.attachView(modalComponent.hostView);
		this.renderer.appendChild(document.body, modalComponent.location.nativeElement);
    Object.keys(options).forEach(option => {
      modalComponent.instance[option] = options[option];
    });
    modalComponent.instance.show();
    modalComponent.changeDetectorRef.detectChanges();
    const contentNode = modalComponent.instance.getContentNode();
    const contentHostNode = document.createElement('div');
		this.renderer.appendChild(contentNode, contentHostNode);
    this.modal = modalComponent.instance as any;
    if (componentClass instanceof TemplateRef) {
      const embeddedViewRef = componentClass.createEmbeddedView(componentClass as any);
      embeddedViewRef.rootNodes.forEach(node => {
        this.renderer.appendChild(contentNode, node);
      });
      embeddedViewRef.detectChanges();
      this.appRef.attachView(embeddedViewRef);
    } else  {
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

    return this.modal as ModalRef<T>;
  }

  hide() {
    this.modal.hide();
  }
}
