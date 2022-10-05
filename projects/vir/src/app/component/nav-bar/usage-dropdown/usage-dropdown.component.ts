import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

@Component({
  selector: 'vir-usage-dropdown',
  templateUrl: './usage-dropdown.component.html',
  styleUrls: [
    './usage-dropdown.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageDropdownComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter<void>();

  user$ = this.userService.user$;

  private destroyListener;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private userService: UserService
  ) {}
  ngOnInit() {
    this.destroyListener = this.renderer.listen(this.elementRef.nativeElement, 'click', (e) => {
      e.stopPropagation();
    });
  }
  onClose() {
    this.close.emit();
  }
  ngOnDestroy() {
    if (this.destroyListener) {
      this.destroyListener();
    }
  }
}
