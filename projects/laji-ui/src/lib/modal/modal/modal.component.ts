/* eslint-disable @angular-eslint/no-output-on-prefix */
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, Output, Renderer2,
  ViewChild } from '@angular/core';
import { filter } from 'rxjs/operators';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'lu-modal',
  template:`
    <div class="lu-backdrop"></div>
    <div class="lu-modal-container" [class]="'lu-modal-' + _size" *ngIf="isShown" #container>
      <lu-button-round *ngIf="!noClose" (click)="hide()" role="neutral" class="lu-modal-close-button">
        <lu-icon type="close"></lu-icon>
      </lu-button-round>
      <div [class]="['lu-modal-content', contentClass]" role="dialog">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnDestroy {

  protected _size: ModalSize = 'md';

  /**
   * One of 'sm', 'md', 'lg', 'xl'. Defaults to 'md'
   */
  @Input() set size(size: ModalSize) {
    this._size = size;
  }

  // null becuase undefined in the template [class] causes error.
  @Input() contentClass: string | null = null;

  /**
   * Modal can't be closed by clicking backdrop and the close button is hidden.
   * The parent component must handle closing the modal manually.
   */
  @Input() noClose = false;

  /**
   * Emits true/false according to when the modal shows/hides.
   */
  @Output() onShownChange = new EventEmitter<boolean>();
  @Output() onHide = this.onShownChange.pipe(filter(shown => shown === false));
  @Output() onShow = this.onShownChange.pipe(filter(shown => shown === true));
  public isShown = false;

  @ViewChild('container', {static: false}) containerRef?: ElementRef;

  private originalBodyOverflow?: string;
  private originalDomParent?: HTMLElement;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef
  ) {
    this.hide = this.hide.bind(this);
    this.hideElement();
  }

	ngOnDestroy(): void {
    this.hide();
	}

  @HostListener('document:keydown.escape')
  private hideOnEsc() {
    if (this.noClose) {
      return;
    }
    this.hide();
  }

  @HostListener('click', ['$event.target'])
  private onClick(target: HTMLElement) {
    if (!this.noClose && target === this.containerRef?.nativeElement) {
      this.hide();
    }
  }

  public show() {
    if (this.isShown) {
      return;
    }
    this.originalBodyOverflow = this.document.body.style.overflow;
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'block');

    this.moveToBody();

    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    this.isShown = true;
    this.onShownChange.emit(true);
    this.cdr.markForCheck();
  }

  public hide(): boolean {
    if (!this.isShown) {
      return false;
    }
    this.moveToOrigParent();
    this.hideElement();

    this.isShown = false;
    this.onShownChange.emit(false);
    this.cdr.markForCheck();
    return true;
  }

  public getContentNode() {
    return this.elementRef.nativeElement.querySelector('.lu-modal-content');
  }

	private moveToBody() {
		this.originalDomParent = this.elementRef.nativeElement.parentElement;
		this.renderer.appendChild(this.document.body,	this.elementRef.nativeElement);
	}

	private moveToOrigParent() {
    if (!this.originalDomParent) {
      return;
    }
		this.renderer.appendChild(this.originalDomParent,	this.elementRef.nativeElement);
	}

  private hideElement() {
    if (this.originalBodyOverflow) {
      this.renderer.setStyle(this.document.body, 'overflow', this.originalBodyOverflow);
    } else {
      this.renderer.removeStyle(this.document.body, 'overflow');
    }

    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
  }
}
