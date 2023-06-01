import { AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModelViewerService } from './model-viewer.service';
import { GLB } from './webgl/glb-parser';
import { M4, V3 } from './webgl/math-3d';
import { rotateObjectRelativeToViewport } from './webgl/renderer-utils';
import { MiniRenderer } from './webgl/mini-renderer';

// https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
const resizeCanvasToDisplaySize = (canvas: any): boolean => {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
};

@Component({
  selector: 'laji-model-viewer',
  template: `
<canvas #canvas
  (mousedown)="onMouseDown($event)"
  (touchstart)="onTouchstart($event)"
  (wheel)="onWheel($event)"
></canvas>
  `,
  styleUrls: ['./model-viewer.component.scss']
})
export class ModelViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasElem: ElementRef;

  private glr: MiniRenderer;
  private destroyMousemoveListener: () => void;
  private destroyMouseupListener: () => void;
  private destroyTouchmoveListener: () => void;
  private destroyTouchendListener: () => void;
  private resizeObserver: ResizeObserver;

  private viewerIsActive = false;

  constructor(private ngRenderer: Renderer2, private mvs: ModelViewerService) {}

  ngAfterViewInit(): void {
    this.glr = new MiniRenderer(this.canvasElem.nativeElement);
    this.mvs.getTestGLB().pipe(
      switchMap(b => from(GLB.parseBlob(b)))
    ).subscribe(([bufferData, jsonData]) => {
      this.glr.loadModel(bufferData[0], jsonData);
      this.glr.render();
      this.viewerIsActive = true;
    });
    this.resizeObserver = new ResizeObserver(this.onCanvasResize.bind(this));
    this.resizeObserver.observe(this.canvasElem.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }

  onCanvasResize(event: any) {
    if (resizeCanvasToDisplaySize(this.canvasElem.nativeElement)) {
      this.glr.updateViewportSize();
    }
  }

  onMouseDown(mousedownEvent: MouseEvent) {
    if (!this.viewerIsActive) { return; }
    let mouseX = mousedownEvent.clientX;
    let mouseY = mousedownEvent.clientY;
    this.destroyMousemoveListener = this.ngRenderer.listen(
      window, 'mousemove', (mousemoveEvent: MouseEvent) => {
        if (!this.glr.scene.entity) { return; }
        const xDiff = mousemoveEvent.clientX - mouseX;
        const yDiff = mousemoveEvent.clientY - mouseY;
        const amt = 0.01;
        const newTransform = rotateObjectRelativeToViewport(this.glr.scene.camera.transform, this.glr.scene.entity.transform, yDiff*amt, xDiff*amt);
        this.glr.scene.entity.transform = newTransform;
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

  onTouchstart(touchstartEvent: TouchEvent) {
    if (!this.viewerIsActive) { return; }
    let touchX = touchstartEvent.targetTouches[0].clientX;
    let touchY = touchstartEvent.targetTouches[0].clientY;
    this.destroyTouchmoveListener = this.ngRenderer.listen(
      window, 'touchmove', (touchmoveEvent: TouchEvent) => {
        if (!this.glr.scene.entity) { return; }
        const xDiff = touchmoveEvent.targetTouches[0].clientX - touchX;
        const yDiff = touchmoveEvent.targetTouches[0].clientY - touchY;
        const amt = 0.01;
        const newTransform = rotateObjectRelativeToViewport(this.glr.scene.camera.transform, this.glr.scene.entity.transform, yDiff*amt, xDiff*amt);
        this.glr.scene.entity.transform = newTransform;
        this.glr.render();
        touchX = touchmoveEvent.targetTouches[0].clientX;
        touchY = touchmoveEvent.targetTouches[0].clientY;
      }
    );
    this.destroyTouchendListener = this.ngRenderer.listen(
      window, 'touchend', (touchendEvent: TouchEvent) => {
        this.destroyTouchmoveListener();
        this.destroyTouchendListener();
      }
    );
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const c = M4.extractTranslation(this.glr.scene.camera.transform);
    const m = M4.extractTranslation(this.glr.scene.entity.transform);
    const cm = V3.sub(m, c);
    const cm2 = V3.scale(cm, -1 * event.deltaY * .001);
    this.glr.scene.camera.transform = M4.mult(this.glr.scene.camera.transform, M4.translation(cm2[0], cm2[1], cm2[2]));
    this.glr.render();
  }
}
