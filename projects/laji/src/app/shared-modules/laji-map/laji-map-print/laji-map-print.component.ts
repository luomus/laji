import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { PlatformService } from '../../../root/platform.service';
import { LajiMapComponent } from '../laji-map.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-map-print',
  template: `
    <div #printControlWell [ngStyle]="{'display': 'none'}">
      <div class="print-mode-controls" [ngClass]="'print-mode-controls-' + printControlPosition" id="print-controls" #printControl>
        <laji-pdf-button
          [element]="printElement"
          role="primary"
          [title]="'map.front.print.pdf.tooltip' | translate"
        ></laji-pdf-button>
        <button
          type="button"
          class="btn btn-danger mt-2"
          [title]="'map.front.print.stop.tooltip' | translate"
          (click)="togglePrintMode($event)"
        >
          {{ 'map.front.print.stop' | translate }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./laji-map-print.component.scss'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiMapPrintComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) lajiMap: LajiMapComponent | undefined;
  @Input() printControlPosition: 'topleft'|'topright' = 'topright';
  @Input() printMode = false;
  @Input() printElement?: HTMLElement;

  @Output() printModeChange = new EventEmitter<boolean>();

  @ViewChild('printControlWell') printControlsWell!: {nativeElement: HTMLDivElement};
  @ViewChild('printControl') printControls!: {nativeElement: HTMLDivElement};

  private mapLoadedSubscription?: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private platformService: PlatformService
  ) { }

  ngOnDestroy() {
    this.mapLoadedSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lajiMap) {
      this.mapLoadedSubscription?.unsubscribe();
      if (this.lajiMap) {
        this.mapLoadedSubscription = this.lajiMap.loaded.subscribe(() => {
          this.printModeSideEffects();
        });
      }
    }

    if (changes.printMode) {
      this.printModeSideEffects();
    }
  }

  togglePrintMode(e: MouseEvent) {
    if (!this.platformService.isBrowser) {
      return;
    }

    e.stopPropagation();

    this.printMode = !this.printMode;
    this.printModeSideEffects();
    this.printModeChange.emit(this.printMode);
  }

  private printModeSideEffects() {
    this.cd.detectChanges();
    this.lajiMap?.map?.map.invalidateSize();

    const printControlsElem = this.printControls.nativeElement;
    const lajiMapPrintControl = document.querySelector('.laji-map .glyphicon-print')?.parentElement?.parentElement;
    if (this.printMode) {
      lajiMapPrintControl?.appendChild(printControlsElem);
      lajiMapPrintControl?.classList.add('transparent-border');
    } else {
      this.printControlsWell.nativeElement.appendChild(printControlsElem);
      lajiMapPrintControl?.classList.remove('transparent-border');
    }
  }
}
