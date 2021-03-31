import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GeneticResourceComponent } from './genetic-resource.component';

describe('SearchComponent', () => {
  let component: GeneticResourceComponent;
  let fixture: ComponentFixture<GeneticResourceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticResourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
