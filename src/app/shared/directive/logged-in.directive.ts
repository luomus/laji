import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserService } from '../service/user.service';
import { Observable, Subscription } from 'rxjs';
import { startWith, switchMap, tap } from 'rxjs/operators';

@Directive({
  selector: '[lajiLoggedIn]'
})
export class LoggedInDirective implements OnInit, OnDestroy {

  @Input() lajiLoggedIn: boolean;

  private visible = false;
  private userActions: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.userActions = this.userService.action$.pipe(
      startWith(true),
      switchMap(() => this.checkLogin())
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.userActions) {
      this.userActions.unsubscribe();
    }
  }

  private checkLogin(): Observable<boolean> {
    const onlyLoggedIn = this.lajiLoggedIn === null || typeof this.lajiLoggedIn === 'undefined' ? true : this.lajiLoggedIn;
    return this.userService.isLoggedIn$.pipe(
      tap(isLoggedIn => {
        const shouldBeVisible = (onlyLoggedIn && isLoggedIn) || (!onlyLoggedIn && !isLoggedIn);
        if (shouldBeVisible && !this.visible) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (!shouldBeVisible && this.visible) {
          this.viewContainer.clear();
        }
        this.visible = shouldBeVisible;
        this.cdr.markForCheck();
      })
    );
  }

}
