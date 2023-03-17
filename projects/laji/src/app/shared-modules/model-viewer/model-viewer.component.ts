import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ModelViewerService } from './model-viewer.service';
import { glLoadModel, GLRenderer } from './webgl/gl-renderer';
import { rotateObjectRelativeToViewport } from './webgl/renderer-utils';

@Component({
  selector: 'laji-model-viewer',
  template: `
<canvas #canvas
  width="800"
  height="600"
  (mousedown)="onMouseDown($event)"
></canvas>
  `
})
export class ModelViewerComponent implements AfterViewInit {
  @ViewChild('canvas') canvasElem: ElementRef;

  private glr: GLRenderer;
  private destroyMousemoveListener: () => void;
  private destroyMouseupListener: () => void;

  private viewerIsActive = false;

  constructor(private ngRenderer: Renderer2, private mvs: ModelViewerService) {}

  ngAfterViewInit(): void {
    this.glr = new GLRenderer(this.canvasElem.nativeElement);
    this.mvs.getTestModel().subscribe(d => {
      glLoadModel(this.glr, d);
      this.glr.render();
      this.viewerIsActive = true;
    });
  }

  onMouseDown(mousedownEvent: MouseEvent) {
    if (!this.viewerIsActive) { return; }
    let mouseX = mousedownEvent.clientX;
    let mouseY = mousedownEvent.clientY;
    this.destroyMousemoveListener = this.ngRenderer.listen(
      window, 'mousemove', (mousemoveEvent: MouseEvent) => {
        const xDiff = mousemoveEvent.clientX - mouseX;
        const yDiff = mousemoveEvent.clientY - mouseY;
        const amt = 0.01;
        const newTransform = rotateObjectRelativeToViewport(this.glr.camera.transform, this.glr.drawables[0].transform, yDiff*amt, xDiff*amt);
        this.glr.drawables = [{
          ...this.glr.drawables[0],
          transform: newTransform
        }];
        this.glr.render();
        mouseX = mousemoveEvent.clientX;
        mouseY = mousemoveEvent.clientY;
      }
    );
    this.destroyMouseupListener = this.ngRenderer.listen(
      window, 'mouseup', (mouseupEvent: MouseEvent) => {
        this.destroyMousemoveListener();
        this.destroyMouseupListener();
      }
    );
  }
}
