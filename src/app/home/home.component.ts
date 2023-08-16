import { Component } from '@angular/core';
import { BestPair } from '../models/employee';
import { EmployeesService } from '../services/employees.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  public bestPair!: BestPair;

  constructor(private employeesService: EmployeesService) { }

  public async importFromCsv(event: Event) {
    const textContent = await this.getImportedFileTextContent(event);
    const data = textContent ? this.employeesService.getEmployeesFromCsvText(textContent) : [];
    this.bestPair = this.employeesService.getBestPair(data);
  }

  private async getImportedFileTextContent(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file: File = input.files[0];
    return await file.text();
  }
}
