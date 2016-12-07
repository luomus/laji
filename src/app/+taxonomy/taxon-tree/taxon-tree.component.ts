import { Component, ViewChild, ElementRef } from '@angular/core';

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
export class TaxonTree {

  private static LEVEL = 2;

  private options = null;
  private nodes = [];

  private taxonList: Observable<Array<Taxonomy>>;

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  constructor(
    private taxonService: TaxonomyApi,
    private translate: TranslateService,
    private router: Router
  ) {
    this.options = {
      actionMapping: {
        mouse: {
          click: (tree, node, $event) => {
            router.navigate(['taxon', node.data.id]);
          }
        }
      },
      displayField: 'scientificName',
      getChildren: this.getChildren.bind(this)
    };
  }

  ngAfterViewInit() {
    this.translate.onLangChange
      .map((data) => data.lang)
      .startWith(this.translate.currentLang)
      .switchMap((lang) => this.taxonService
        .taxonomyFindBySubject('MX.37600', lang, {
          maxLevel: TaxonTree.LEVEL
        }))
      .subscribe((data) => {
        this.nodes = [data];
      }, (error) => {
        console.error(error);
      });
  }

  getChildren(node: TreeNode) {
    return this.taxonService
      .taxonomyFindChildren(node.id, this.translate.currentLang)
      .toPromise();
  }

}
