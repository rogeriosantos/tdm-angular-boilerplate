import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostunitSelectorComponent } from './costunit-selector.component';

describe('CostunitSelectorComponent', () => {
  let component: CostunitSelectorComponent;
  let fixture: ComponentFixture<CostunitSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostunitSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostunitSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
