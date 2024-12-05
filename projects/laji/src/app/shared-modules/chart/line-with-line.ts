import { LineController } from 'chart.js';

/**
 * Registers automatically upon import (or to be precise, when the chart module is loaded).
 */
export class LineWithLine extends LineController {
  static id = 'LineWithLine';
  draw() {
    super.draw();
    if ((this.chart.tooltip as any)._active?.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const colWidth = Math.ceil((this['chart'].chartArea['right'] - this['chart'].chartArea['left']) / this['chart'].config.data.labels!.length);
      const activePoint = (this.chart.tooltip as any)._active[0].element;
      const ctx = this.chart.ctx;
      const x = Number((activePoint.tooltipPosition().x).toFixed(0));
      const y = Number((activePoint.tooltipPosition().y).toFixed(0));
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const topY = this.chart.legend!.bottom;
      const bottomY = this.chart.chartArea.bottom;
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(70,130,180,1)');
      gradient.addColorStop(0.8, 'rgba(70,130,180,0.1)');
      const range = (start: number, end: number, step: number) => Array.from(Array.from(Array(Math.ceil((end - start) / step)).keys()), el => start + el * step);

      if (range(x - (colWidth / 2), x + ((colWidth / 2)), 1).indexOf((this.chart.tooltip as any)._eventPosition.x) === -1  &&
        range(y, y, 1).indexOf((this.chart.tooltip as any)._eventPosition.y) === -1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 9;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}
