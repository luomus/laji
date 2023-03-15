import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { glLoadModel, GLRenderer } from './webgl/gl-renderer';
import { M4 } from './webgl/math-3d';
import { cameraOrbit } from './webgl/renderer-utils';

@Component({
  selector: 'laji-model-viewer',
  template: `
<canvas #canvas
  width="800"
  height="600"
  style="background-color: #333333"
  (mousedown)="onMouseDown($event)"
></canvas>
  `
})
export class ModelViewerComponent implements AfterViewInit {
  @ViewChild('canvas') canvasElem: ElementRef;

  private glr: GLRenderer;
  private destroyMousemoveListener: () => void;
  private destroyMouseupListener: () => void;

  constructor(private ngRenderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.glr = new GLRenderer(this.canvasElem.nativeElement);
    glLoadModel(this.glr);
    this.glr.render();
  }

  onMouseDown(mousedownEvent: MouseEvent) {
    console.log(mousedownEvent);
    let x = mousedownEvent.clientX;
    let y = mousedownEvent.clientY;
    this.destroyMousemoveListener = this.ngRenderer.listen(
      window, 'mousemove', (mousemoveEvent: MouseEvent) => {
        console.log('Moved: ', mousemoveEvent);
        const xDiff = mousemoveEvent.clientX - x;
        const yDiff = mousemoveEvent.clientY - y;
        const amt = 0.01;
        const oldTransform = this.glr.drawables[0].transform;
        const newTransform = M4.mult(M4.mult(oldTransform, M4.yRotation(xDiff*amt)), M4.xRotation(yDiff*amt));
        this.glr.drawables = [{
          ...this.glr.drawables[0],
          transform: newTransform
        }];
        this.glr.render();
        x = mousemoveEvent.clientX;
        y = mousemoveEvent.clientY;
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
