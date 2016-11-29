import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

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

  private nodes = null;
  private options = null;

  private taxonList: Observable<Array<Taxonomy>>;

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  @ViewChild('input')
  private inputElRef: ElementRef;

  constructor(private taxonService: TaxonomyApi) {
    this.options = {
      actionMapping: {
        mouse: {
          click: (tree, node, $event) => {
            console.log(node);
          },
          expanderClick: (tree, node, $event) => {
            node.children = node.children || [];
            if (node.hasChildren && node.children.length < 1) {
              taxonService.taxonomyFindChildren(node.id).subscribe((data) => {
                node.children = data.map((item) => new TreeNode(item, node, tree));
              });
            }
            return TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
          }
        }
      },
      displayField: 'scientificName'
    };
  }

  ngOnInit() {
    this.taxonList = this.taxonService
      .taxonomyFindBySubject('MX.53761', undefined, { maxLevel: '3' }).map((value) => {
        return [value];
      });

    Observable.fromEvent(this.inputElRef.nativeElement, 'keyup')
      .debounceTime(400)
      .subscribe(event => {
        const text = (event as any).target.value;
        if (text.length > 4) {
          this.tree.treeModel.filterNodes(text, true);
          this.taxonService.taxonomySearch(text).subscribe((data) => {
            console.log(data);
          });
        } else {
          this.traverse(this.tree.treeModel.roots);
        }
      });
  }

  traverse(nodes) {
    nodes.forEach((node: TreeNode) => {
      node.setIsExpanded(false);
      node.isHidden = false;
      this.traverse(node.children || []);
    });
  }
}
