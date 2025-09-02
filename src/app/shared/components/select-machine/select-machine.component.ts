import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

interface MockMachine {
  id: string;
  name: string;
}

interface MockJob {
  id: string;
  description: string;
  machineId: string;
}

@Component({
  selector: 'app-select-machine',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './select-machine.component.html',
  styleUrls: ['./select-machine.component.scss'],
})
export class SelectMachineComponent implements OnInit {
  selectMachinesControl = new FormControl('');
  selectJobsControl = new FormControl('');

  selectedMachine: MockMachine | null = null;
  selectedJob: MockJob | null = null;

  // Mock data
  mockMachines: MockMachine[] = [
    { id: 'MCH001', name: 'CNC Machine A' },
    { id: 'MCH002', name: 'Lathe Machine B' },
    { id: 'MCH003', name: 'Milling Machine C' },
    { id: 'MCH004', name: 'Grinding Machine D' },
  ];

  mockJobs: MockJob[] = [
    { id: 'JOB001', description: 'Cylinder Head Machining', machineId: 'MCH001' },
    { id: 'JOB002', description: 'Bearing Housing', machineId: 'MCH001' },
    { id: 'JOB003', description: 'Shaft Turning', machineId: 'MCH002' },
    { id: 'JOB004', description: 'Gear Cutting', machineId: 'MCH003' },
    { id: 'JOB005', description: 'Surface Grinding', machineId: 'MCH004' },
    { id: 'JOB006', description: 'Valve Seat Machining', machineId: 'MCH001' },
  ];

  get filteredJobs(): MockJob[] {
    if (!this.selectedMachine) {
      return [];
    }
    return this.mockJobs.filter((job) => job.machineId === this.selectedMachine?.id);
  }

  ngOnInit(): void {
    // Initialize form controls
    this.selectMachinesControl.valueChanges.subscribe(() => {
      // Reset job selection when machine changes
      if (!this.selectMachinesControl.value) {
        this.selectedMachine = null;
        this.selectJobsControl.setValue('');
        this.selectedJob = null;
      }
    });
  }

  displayFnMachine = (machine: MockMachine): string => {
    return machine ? `${machine.id} - ${machine.name}` : '';
  };

  displayFnJob = (job: MockJob): string => {
    return job ? `${job.id} - ${job.description}` : '';
  };

  onMachineOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedMachine = event.option.value;
    // Reset job selection when machine changes
    this.selectJobsControl.setValue('');
    this.selectedJob = null;
    console.log('Selected machine:', this.selectedMachine);
  }

  onJobOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedJob = event.option.value;
    console.log('Selected job:', this.selectedJob);
  }

  clearMachineSelection(event: Event): void {
    event.stopPropagation();
    this.selectMachinesControl.setValue('');
    this.selectedMachine = null;
    this.selectJobsControl.setValue('');
    this.selectedJob = null;
  }

  clearJobSelection(event: Event): void {
    event.stopPropagation();
    this.selectJobsControl.setValue('');
    this.selectedJob = null;
  }
}
