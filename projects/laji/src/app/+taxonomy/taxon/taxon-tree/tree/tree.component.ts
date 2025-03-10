import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TreeNode, TreeSkipParameter } from './model/tree.interface';
import { Tree } from './service/tree';

@Component({
  selector: 'laji-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeComponent implements OnChanges, OnDestroy {
  @Input() getData!: (id: string) => Observable<any>;
  @Input() getChildren!: (id: string) => Observable<any[]>;
  @Input() getParents!: (id: string) => Observable<any[]>;

  @Input() skipParams!: TreeSkipParameter[];
  @Input() activeId!: string;

  @Input() labelTpl!: TemplateRef<any>;

  tree: Tree | undefined;

  private initialViewSub: Subscription | undefined;

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData || changes.getChildren || changes.getParents) {
      this.tree = new Tree(this.getData, this.getChildren, this.getParents);
    }

    if (changes.activeId || changes.skipParams) {
      if (this.initialViewSub) {
        this.initialViewSub.unsubscribe();
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.initialViewSub = this.tree!.setView(this.activeId, this.skipParams)
        .subscribe(() => {
          this.cd.markForCheck();
        });
    }
  }

  ngOnDestroy() {
    if (this.initialViewSub) {
      this.initialViewSub.unsubscribe();
    }
  }

  toggle(node: TreeNode) {
    if (!node.value.hasChildren) {
      return;
    }

    if (node.state.isExpanded) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tree!.hideNode(node);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tree!.openNode(node)
        .subscribe(() => {
          this.cd.markForCheck();
        });
    }
  }
}
