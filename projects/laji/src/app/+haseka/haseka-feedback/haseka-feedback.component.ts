import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-haseka-feedback',
  templateUrl: './haseka-feedback.component.html',
  styleUrls: ['./haseka-feedback.component.scss']
})
export class HasekaFeedbackComponent implements OnInit {

  public displayFeedback$: Observable<boolean>;

  constructor(private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {
    this.displayFeedback$ = this.router.events.pipe(
      filter(evt => evt instanceof NavigationEnd),
      switchMap(() => this.route.firstChild.data),
      map(data => data.displayFeedback !== false)
    );
  }

}
