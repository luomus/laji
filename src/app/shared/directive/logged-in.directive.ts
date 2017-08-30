import { Directive, TemplateRef, ViewContainerRef, Input, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../service/user.service';
import { Subscription } from 'rxjs/Subscription';

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
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userActions = this.userService.action$
      .startWith(true)
      .subscribe(() => this.checkLogin());
  }

  ngOnDestroy() {
    this.userActions.unsubscribe();
  }

  private checkLogin() {
    const onlyLoggedIn = this.lajiLoggedIn === null || typeof this.lajiLoggedIn === 'undefined' ? true : this.lajiLoggedIn;
    const shouldBeVisible =
      (onlyLoggedIn && this.userService.isLoggedIn) ||
      (!onlyLoggedIn && !this.userService.isLoggedIn);

    if (shouldBeVisible && !this.visible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (!shouldBeVisible && this.visible) {
      this.viewContainer.clear();
    }
    this.visible = shouldBeVisible;
  }

}
