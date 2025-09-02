import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMachineComponent } from './select-machine.component';

describe('SelectMachineComponent', () => {
  let component: SelectMachineComponent;
  let fixture: ComponentFixture<SelectMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectMachineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
