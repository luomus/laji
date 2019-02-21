import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'laji-about',
  template: `
    <laji-simple-omni></laji-simple-omni>
    <div class="container">
      <div id="wrapper" class="row">
        <div class="col-sm-6 col-md-7 col-lg-8">
          <ol class="breadcrumb">
            <li *ngFor="let parent of parents; let f=first">
              <a [routerLink]="[(f ? '/about' : '/about/' + parent.id)] | localize">
                {{ parent.menuTitle }}
              </a>
            </li>
            <li class="active">{{ title }}</li>
          </ol>
          <laji-info-page
            [rootPage]="{'fi': 'r-19', 'en': 'r-21', 'sv': 'r-23'}"
            [child]="activePage"
            (title)="setTitle($event)"
            (parents)="parents = $event"
            (children)="children = $event"
          ></laji-info-page>
        </div>
        <div class="col-sm-6 col-md-5 col-lg-4 more-info" *ngIf="children.length > 0">
          <div class="media">
            <div class="media-body" style="background-color: #f5f5f5; max-width: 300px; padding: 10px;">
              <h4 class="media-heading">
                {{ 'information.more' | translate }}
              </h4>
              <ul>
                <li *ngFor="let child of children">
                  <a [routerLink]="['/about/' + child.id] | localize">
                    {{ child.menuTitle }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      z-index: auto;
    }

    .about {
      padding-bottom: 30px;
    }
    
    .more-info {
      background: none;
    }

    @media only screen and (min-width : 768px) {
      .more-info .media {
        position: fixed;
      }

      #wrapper {
        display: flex;
      }
    }
  `]
})
export class AboutComponent implements OnInit, OnDestroy {
  activePage = '';
  title = '';
  parents = [];
  children = [];
  private querySub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.querySub = this.route.params.subscribe(params => {
      this.activePage = params.id || '';
    });
  }

  ngOnDestroy(): void {
    this.querySub.unsubscribe();
  }

  setTitle(title: string) {
    this.title = title;
    this.titleService.setTitle(title + ' | ' + this.titleService.getTitle());
  }
}
