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
    <div class="lu-modal-container" [class]="'lu-modal-' + size" *ngIf="isShown" #container>
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

  /**
   * One of 'sm', 'md', 'lg', 'xl'. Defaults to 'md'.
   */
  @Input() size: ModalSize;

  // null because undefined in the template [class] causes error.
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
  isShown = false;

  @ViewChild('container', {static: false}) containerRef?: ElementRef;

  private originalBodyOverflow?: string;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef
  ) {
    this.hideElement();
  }

  ngOnDestroy() {
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

  show() {
    if (this.isShown) {
      return;
    }
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'block');
    this.hijackBodyOverflow();
    this.isShown = true;
    this.onShownChange.emit(true);
    this.cdr.markForCheck();
  }

  hide(): boolean {
    if (!this.isShown) {
      return false;
    }
    this.hideElement();
    this.releaseBodyOverflow();
    this.isShown = false;
    this.onShownChange.emit(false);
    this.cdr.markForCheck();
    return true;
  }

  getContentNode(): HTMLElement {
    return this.elementRef.nativeElement.querySelector('.lu-modal-content');
  }

  private hideElement() {
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
  }

  private hijackBodyOverflow() {
    this.originalBodyOverflow = this.document.body.style.overflow;
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  private releaseBodyOverflow() {
    if (this.originalBodyOverflow) {
      this.renderer.setStyle(this.document.body, 'overflow', this.originalBodyOverflow);
    } else {
      this.renderer.removeStyle(this.document.body, 'overflow');
    }
  }
}
