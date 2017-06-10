import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TREE_ACTIONS, TreeComponent, TreeNode } from 'angular-tree-component';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { ITreeNode } from 'angular-tree-component/dist/defs/api';

@Component({
  selector: 'laji-tree',
  templateUrl: './taxon-tree.component.html',
  styleUrls: ['./taxon-tree.component.css']
})
export class TaxonTreeComponent implements AfterViewInit, OnDestroy, OnChanges {
  private static cache;

  @Input() openId: string;

  public options = null;
  public nodes = [];

  @ViewChild(TreeComponent)
  private tree: TreeComponent;
  private selectedFields  = 'id,hasChildren,scientificName,vernacularName,taxonRank';

  constructor(
    private taxonService: TaxonomyApi
  ) {
    this.options = {
      actionMapping: {
        mouse: {
          click: TREE_ACTIONS.TOGGLE_EXPANDED
        }
      },
      displayField: 'scientificName',
      getChildren: this.getChildren.bind(this)
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['openId'] && this.openId) {
      this.openTreeById(this.openId);
    }
  }

  ngOnDestroy() {
    TaxonTreeComponent.cache = this.getOpenNodesFromTree(this.tree.treeModel.roots);
  }

  ngAfterViewInit() {
    (TaxonTreeComponent.cache ?
      Observable.of(TaxonTreeComponent.cache).delay(100) :
      this.taxonService
        .taxonomyFindBySubject('MX.37600', 'multi', {selectedFields: this.selectedFields})
        .map(data => [data] ))
      .do((data) => {
        this.nodes = data;
        this.tree.treeModel.update();
      })
      .delay(100)
      .subscribe(() => {
        if (TaxonTreeComponent.cache) {
          this.openTree(this.tree.treeModel.roots);
        }
        if (this.openId) {
          this.openTreeById(this.openId);
        }
      }, (error) => {
        console.error(error);
      });
  }

  openTreeById(id: string) {
    if (!id) { return; }
    this.taxonService
      .taxonomyFindParents(id)
      .map(taxa => taxa.map(taxon => taxon.id))
      .subscribe(taxa => {
        this.goTo([...taxa, id]);
      });
  }

  getOpenNodesFromTree(roots: TreeNode[]) {
    return roots.map((root: TreeNode) => {
      const data = root.data;
      data['children'] = (root.children && data.isExpandedField) ? this.getOpenNodesFromTree(root.children) : undefined;
      data['hasChildren'] = root.hasChildren;
      return data;
    });
  }

  openTree(roots: TreeNode[]) {
    roots.map(root => {
      if (root.data.isExpandedField) {
        root.expand();
      }
      if (root.children) {
        this.openTree(root.children);
      }
    });
  }

  onToggle(params: {eventName: string, node: ITreeNode, isExpanded: boolean}) {
    params.node.data.isExpandedField = params.isExpanded;
    if (!params.isExpanded) {
      this.closeChildren(params.node.children);
    }
  }

  closeChildren(nodes: ITreeNode[]) {
    if (nodes) {
      nodes.map(node => {
        if (node.children) {
          this.closeChildren(node.children);
        }
        node.collapse();
      });
    }
  }

  goTo(parents: string[]) {
    const roots = this.tree.treeModel.roots;
    this.travelTo(parents, roots);
  }

  travelTo(parents: string[], roots: TreeNode[]) {
    if (!parents || parents.length === 0) {
      return;
    }
    const id = parents.shift();
    roots.map((elem: TreeNode) => {
      if (elem.id === id) {
        if (parents.length > 0) {
          elem.expand()
            .then(() => {
              this.tree.treeModel.update();
              if (elem.children) {
                this.travelTo(parents, elem.children);
              } else if (elem.hasChildren) {
                this.getChildren(elem)
                  .then((children) => {
                    elem.setField('children', children);
                    elem._initChildren();
                    this.travelTo(parents, elem.children);
                  });
              }
            });
        } else if (parents.length === 0) {
          elem.focus();
          elem.scrollIntoView();
          this.tree.treeModel.update();
        }
      }
    });
  }

  getChildren(node: TreeNode) {
    return this.taxonService
      .taxonomyFindChildren(node.id, 'multi', undefined, {selectedFields: this.selectedFields})
      .toPromise();
  }

}
