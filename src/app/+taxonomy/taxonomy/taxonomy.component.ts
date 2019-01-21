import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxonomy.component.html',
  styleUrls: ['./taxonomy.component.css']
})
export class TaxonomyComponent implements OnInit, OnDestroy {
  taxonId: string;
  infoCardContext: string;

  sidebarWidth = 225;
  showTree = true;

  private dragging = false;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subParam = combineLatest(this.route.params, this.route.queryParams).subscribe(data => {
      this.taxonId = data[0]['id'];
      this.infoCardContext = data[0]['context'] || data[1]['context'] || 'default';
      this.showTree = data[1]['showTree'] === 'false' ? false : true;
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
  }


  startDragging(e) {
    e.preventDefault();
    this.dragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    if (this.dragging) {
      e.preventDefault();
      this.sidebarWidth = Math.min(Math.max(e.pageX + 2, 120), 450);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e) {
    if (this.dragging) {
      this.dragging = false;
    }
  }

  toggleSidebar() {
    this.showTree = !this.showTree;
    this.updateRoute();
  }

  onDescriptionChange(context: string) {
    this.infoCardContext = context;
    this.updateRoute();
  }

  updateRoute() {
    const params = {};
    if (this.infoCardContext !== 'default') {
      params['context'] = this.infoCardContext;
    }
    if (!this.showTree) {
      params['showTree'] = false;
    }

    this.router.navigate([], {
      queryParams: params,
      replaceUrl: true
    });
  }
}
