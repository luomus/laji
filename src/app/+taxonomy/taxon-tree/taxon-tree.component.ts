import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { TranslateService } from 'ng2-translate/ng2-translate';

import { Observable } from 'rxjs/Observable';

import { TreeComponent, TreeNode, IActionMapping, TREE_ACTIONS } from 'angular2-tree-component';

import { TaxonomyApi, Taxonomy } from '../../shared';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';

@Component({
  selector: 'taxon-tree',
  templateUrl: 'taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTree implements OnInit {

  private static LEVEL = 2;

  private nodes = null;
  private options = null;

  private taxonList: Observable<Array<Taxonomy>>;

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  @ViewChild('input')
  private inputElRef: ElementRef;

  constructor(
    private taxonService: TaxonomyApi,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.options = {
      actionMapping: {
        mouse: {
          click: (tree, node, $event) => {
            console.log(node);
          },
          expanderClick: (tree, node, $event) => {
            if (node.level < TaxonTree.LEVEL) {
              return TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
            } else {
              this.router.navigate(['taxon', 'browse', 'taxonomy', node.id]);
            }
          }
        }
      },
      displayField: 'scientificName'
    };
  }

  ngOnInit() {

    let naks = this.translate.onLangChange.map((data) => data.lang).startWith(this.translate.currentLang)
      .combineLatest(this.route.params.map((data) => (data as any).id).startWith('MX.53761'), (a, b) => ({ a, b }));

    this.taxonList = naks.switchMap((ev) => {
        return this.taxonService
          .taxonomyFindBySubject(ev.b, ev.a, {
            maxLevel: TaxonTree.LEVEL
          });
      });
  }

}
