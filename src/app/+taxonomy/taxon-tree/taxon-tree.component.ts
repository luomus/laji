import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Observable } from 'rxjs/Observable';
import { TreeComponent, TreeNode } from 'angular2-tree-component';
import { Taxonomy } from '../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';

@Component({
  selector: 'laji-tree',
  templateUrl: 'taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent implements AfterViewInit {

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
          maxLevel: TaxonTreeComponent.LEVEL
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
