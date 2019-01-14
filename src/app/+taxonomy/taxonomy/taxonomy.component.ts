import {
  Component,
  OnInit,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxonomy.component.html',
  styleUrls: ['./taxonomy.component.css']
})
export class TaxonomyComponent implements OnInit {
  taxonId: string;
  sidebarWidth = 225;
  showSidebar = true;

  private dragging = false;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(data => {
      this.taxonId = data['id'];
      this.cd.markForCheck();
    });
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
    this.showSidebar = !this.showSidebar;
  }
}
