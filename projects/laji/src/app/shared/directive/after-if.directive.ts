import { Directive, Output, EventEmitter, AfterContentInit } from '@angular/core';

@Directive({
    selector: '[lajiAfterIf]',
    standalone: false
})
export class AfterIfDirective implements AfterContentInit {
  @Output('lajiAfterIf')
  public after: EventEmitter<AfterIfDirective> = new EventEmitter();

  public ngAfterContentInit(): void {
      setTimeout(() => {
         this.after.next(this);
      });
  }
}

