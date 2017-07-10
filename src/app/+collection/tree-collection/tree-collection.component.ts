import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Collection } from '../../shared/model/Collection';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { ViewChild } from '@angular/core';
import { TreeComponent } from 'angular-tree-component';

@Component({
  selector: 'laji-collection-tree',
  templateUrl: './tree-collection.component.html',
  styleUrls: ['./tree-collection.component.css']
})
export class CollectionTreeComponent implements OnInit, OnChanges {
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
    'HR.1989': true
  };

  @Input() collections: Collection[];
  @Input() filter: string;
  nodes: any[];

  constructor() { }

  ngOnInit() {
    this.initTree();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.collections) {
      this.initTree();
    }
    if (!this.tree.treeModel.roots) {
      console.log('NO ROOTS');
      return;
    }
    if (changes.filter) {
      if (!this.filter || this.filter.length === 0) {
        this.tree.treeModel.collapseAll();
      } else {
        this.tree.treeModel.filterNodes(this.filter, true);
      }
    }
  }

  initTree() {
    if (!this.collections || this.nodes) {
      return;
    }
    const lookUp = {};
    const links = {};
    const roots = {};
    this.collections.sort(this.compare);
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
      name: 'other',
      children: other
    });
  }

  private compare(a: Collection, b: Collection) {
    if (a.longName < b.longName) {
      return -1;
    }
    if (a.longName > b.longName) {
      return 1;
    }
    return 0;
  }

  private getTaxonBranch(collection: Collection, lookup: any, links: any, isRoot = true) {
    return {
      id: collection.id,
      name: collection.collectionName,
      children: links[collection.id] ?
        links[collection.id].map(id => this.getTaxonBranch(lookup[id], lookup, links, false)) :
        undefined
    };
  }

}
