import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedTreeNodesComponent } from './selected-tree-nodes.component';

describe('SelectedCollectionsComponent', () => {
  let component: SelectedTreeNodesComponent;
  let fixture: ComponentFixture<SelectedTreeNodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedTreeNodesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedTreeNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
