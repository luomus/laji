import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Collection } from '../../shared/model/Collection';
import { TreeComponent, TreeModel, TreeNode } from 'angular-tree-component';
import { Subject ,  Subscription } from 'rxjs';
import { IdService } from '../../shared/service/id.service';
import { TranslateService } from '@ngx-translate/core';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';

@Component({
  selector: '[laji-collection-tree]',
  templateUrl: './tree-collection.component.html',
  styleUrls: ['./tree-collection.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionTreeComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(TreeComponent) tree: TreeComponent;

  roots = {
    'HR.128': true,
    'HR.1127': true,
    'HR.121': true,
    'HR.1627': true,
    'HR.1247': true,
    'HR.1915': true,
    'HR.1587': true,
    'HR.1909': true,
    'HR.1727': true,
    'HR.1547': true,
    'HR.1989': true,
    'HR.1207': true
  };

  @Input() collections: Collection[];
  @Input() filter: string;
  @Input() activeID: string;
  nodes: any[];
  treeOptions = {
    actionMapping: {
      mouse: {
        click: (tree: TreeModel, node: TreeNode, $event: any) => {
          if (!($event.target && $event.target.className && $event.target.className.indexOf('not-expandable') > -1)) {
            node.toggleExpanded();
          }
        }
      }
    }
  };

  private filterSubject = new Subject();
  private filterSubscription: Subscription;

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.initTree();
    if (this.activeID) {
      setTimeout(() => {
        this.setFocusToCollection(this.activeID);
      }, 10);
    }
    this.filterSubscription = this.filterSubject
      .debounceTime(300)
      .subscribe((value) => {
        if (value === '') {
          this.tree.treeModel.filterNodes('', true);
          this.tree.treeModel.collapseAll();
        } else {
          this.tree.treeModel.filterNodes(value, true);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.collections) {
      this.initTree();
    }
    if (!this.tree.treeModel.roots) {
      return;
    }
    if (changes.activeID) {
      this.setFocusToCollection(this.activeID);
    }
    if (changes.filter) {
      if (!this.filter || this.filter.length === 0) {
        this.filterSubject.next('');
      } else {
        this.filterSubject.next(this.filter);
      }
    }
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  initTree() {
    if (!this.collections || this.nodes) {
      return;
    }
    const lookUp = {};
    const links = {};
    const roots = {};
    this.collections.map(collection => {
      lookUp[collection.id] = collection;
      if (collection.isPartOf) {
        if (!links[collection.isPartOf]) {
          links[collection.isPartOf] = [];
        }
        links[collection.isPartOf].push(collection.id);
      } else {
        roots[collection.id] = true;
      }
    });
    const other = [];
    this.nodes = [];
    Object.keys(roots).map(root => {
      if (this.roots[root]) {
        this.nodes.push(this.getTaxonBranch(lookUp[root], lookUp, links));
      } else {
        other.push(this.getTaxonBranch(lookUp[root], lookUp, links));
      }
    });
    this.nodes.push({
      id: 'other',
      name: 'taxonomy.other',
      children: other
    });
  }

  private getTaxonBranch(collection: Collection, lookup: any, links: any, isRoot = true) {
    return {
      id: collection.id,
      uri: IdService.getUri(collection.id),
      name: MultiLangService.getValue(<any>collection.collectionName, this.translate.currentLang, '%value% (%lang%)'),
      children: links[collection.id] ?
        links[collection.id].map(id => this.getTaxonBranch(lookup[id], lookup, links, false)) :
        undefined
    };
  }

  private setFocusToCollection(id) {
    const node = this.tree.treeModel.getNodeById(id);
    node.ensureVisible();
    node.focus();
  }

}
