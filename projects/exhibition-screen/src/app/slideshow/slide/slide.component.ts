import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { BugPath } from '../bug-animation';
import { PdfModalComponent } from './pdf-modal.component';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';

export interface ISlideData {
  title: string;
  bgSrc?: string;
  bgIsVideo?: boolean;
  bgCaption?: string;
  style: 'front' | 'default';
  contentPlacement: 'left' | 'right';
  content: string;
  animationPlacement?: BugPath[];
}

@Component({
  selector: 'es-slide',
  templateUrl: 'slide.component.html',
  styleUrls: ['slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideComponent implements OnChanges, AfterViewChecked {
  @Input() data!: ISlideData;

  private prevCheckedData: ISlideData | undefined;
  private modalRef: ModalRef | undefined;

  constructor(private el: ElementRef, private renderer: Renderer2, private modalService: ModalService) {}

  ngOnChanges() {
    if (!this.data.bgIsVideo && this.data.bgSrc) {
      this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(${this.data.bgSrc})`);
    }
  }

  ngAfterViewChecked() {
    if (this.prevCheckedData !== this.data) {
      this.registerPdfModalEventListeners();
    }

    this.prevCheckedData = this.data;
  }

  private registerPdfModalEventListeners() {
    const els: HTMLAnchorElement[] = this.el.nativeElement.querySelectorAll('a[href*=".pdf"]');
    els.forEach(el => {
      const href = el.getAttribute('href');
      this.renderer.setAttribute(el, 'href', 'javascript:void(0)');
      this.renderer.listen(el, 'click', event => {
        event.stopImmediatePropagation();
        this.modalRef = this.modalService.show(PdfModalComponent, {size: 'lg'});
        this.modalRef.content.url = href;
      });
    });
  }
}
