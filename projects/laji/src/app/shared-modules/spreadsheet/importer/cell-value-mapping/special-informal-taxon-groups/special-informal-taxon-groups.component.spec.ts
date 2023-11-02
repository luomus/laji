import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpecialInformalTaxonGroupsComponent } from './special-informal-taxon-groups.component';

describe('SpecialInformalTaxonGroupsComponent', () => {
  let component: SpecialInformalTaxonGroupsComponent;
  let fixture: ComponentFixture<SpecialInformalTaxonGroupsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialInformalTaxonGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialInformalTaxonGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
