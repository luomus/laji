import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalizeRouterService } from 'app/locale/localize-router.service';

@Component({
    template: `
    <div class="container">
        <laji-request
            [collectionId]='collectionId'
        ></laji-request>
        <button class="btn btn-default" (click)="back()">Palaa takaisin</button>
    </div>
    `,
    styles: [`
        .container {
            padding: 2em 1em;
        }
    `]
})
export class RequestWrapperComponent implements OnInit, OnDestroy {
    collectionId: string;

    subParams: Subscription;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private localizeRouterService: LocalizeRouterService) {}

    ngOnInit() {
        this.subParams = this.route.params.subscribe((params) => {
            this.collectionId = params['collectionId'];
        });
    }

    ngOnDestroy() {
        this.subParams.unsubscribe();
    }

    back() {
        this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']));
    }
}
