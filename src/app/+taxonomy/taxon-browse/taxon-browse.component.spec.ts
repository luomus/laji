import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonBrowseComponent } from './taxon-browse.component';

describe('BrowseComponent', () => {
  let component: TaxonBrowseComponent;
  let fixture: ComponentFixture<TaxonBrowseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonBrowseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
