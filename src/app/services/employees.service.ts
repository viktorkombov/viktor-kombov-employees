import { Injectable } from '@angular/core';
import { BestPair, Employee } from '../models/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  constructor() { }

  public getEmployeesFromCsvText(csvText: string): Employee[] {
    const lines = (csvText.match(/[^\r\n]+/g) || []);
    const delimiter = this.detectDelimiter(csvText);

    const rows: Employee[] = lines.map((row, i) => {
      const convertedRow = row.split(delimiter);
      const employeeId = convertedRow[0];
      const projectId = convertedRow[1];
      const dateFrom = this.convertToDate(convertedRow[2]);
      const dateTo = this.convertToDate(convertedRow[3]);
      return {
        employeeId,
        projectId,
        dateFrom,
        dateTo,
      }
    });

    return rows;
  }

  public getBestPair(employees: Employee[]): BestPair {
    const bestPair = employees.reduce((currentBestPair: any, currentEmployee: Employee) => {
      const bestPairForTheCurrentEmployee = this.compareEmployees(employees, currentEmployee);

      // if the best pair for the current employee has a longer working time togheter it will become the current best pair
      if (bestPairForTheCurrentEmployee.daysWorked && (currentBestPair.daysWorked && currentBestPair.daysWorked < bestPairForTheCurrentEmployee.daysWorked || currentBestPair.daysWorked === undefined)) {
        return bestPairForTheCurrentEmployee;
      }

      return currentBestPair;
    }, {});

    if (!bestPair.daysWorked) {
      console.error('You have imported a table with invalid data!')
    }

    return bestPair;
  }

  private detectDelimiter(input: string, isDate = false) {
    const commaCount = (input.match(/,/g) || []).length;
    const semicolonCount = (input.match(/;/g) || []).length;
    const tabCount = (input.match(/\t/g) || []).length;
    const slashCount = (input.match(/\//g) || []).length;
    const dotCount = (input.match(/./g) || []).length;
    const dashCount = (input.match(/-/g) || []).length;


    const delimiterCounts: {
      [key: string]: number,
    } = {
      ',': commaCount,
      ';': semicolonCount,
      '\t': tabCount
    };

    if (isDate) {
      Object.assign(delimiterCounts, {
        '/': slashCount,
        '.': dotCount,
        '-': dashCount,
      });
    }

    const mostFrequentDelimiter = Object.keys(delimiterCounts).reduce((a, b) => delimiterCounts[a] > delimiterCounts[b] ? a : b);

    return mostFrequentDelimiter;
  }

  private calculateDaysBetweenDates(startDate: Date, endDate: Date) {
    const oneDay = 24 * 60 * 60 * 1000;

    const diffInDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));

    return diffInDays;
  }

  private compareEmployees(employees: Employee[], currentEmployee: Employee) {
    return employees.reduce((currentBestPairForComparison: any, currentEmployeeForComparison: Employee) => {
      // checks wether the employees have worked togheter
      if (currentEmployee.employeeId === currentEmployeeForComparison.employeeId || currentEmployee.projectId !== currentEmployeeForComparison.projectId) {
        return currentBestPairForComparison;
      }

      const startDate = currentEmployee.dateFrom > currentEmployeeForComparison.dateFrom ? currentEmployee.dateFrom : currentEmployeeForComparison.dateFrom;
      const endDate = currentEmployee.dateTo < currentEmployeeForComparison.dateTo ? currentEmployee.dateTo : currentEmployeeForComparison.dateTo;
      const diffInDays = this.calculateDaysBetweenDates(startDate, endDate);

      if ((currentBestPairForComparison.daysWorked && currentBestPairForComparison.daysWorked < diffInDays) || currentBestPairForComparison.daysWorked === undefined) {
        return {
          firstEmployeeId: currentEmployee.employeeId,
          secondEmployeeId: currentEmployeeForComparison.employeeId,
          projectId: currentEmployee.projectId,
          daysWorked: diffInDays,
        }
      }

      return currentBestPairForComparison;
    }, {});
  }

  private convertToDate(input: any): Date {
    if (!input) {
      return new Date();
    }

    let date = new Date(input)

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return this.formatDate(input);
    }

    return new Date(input);
  }

  private formatDate(input: string) {
    const delimiter = this.detectDelimiter(input, true);
    const dateParts = input.split(delimiter);
    const mappedParts = dateParts.map(part => part = part.length === 1 ? `0${part}` : part)
    if (mappedParts[0].length > 2 && +mappedParts[1] > 12) {
      return new Date(+mappedParts[0], +dateParts[2] - 1, +dateParts[1]);
    } else {
      return new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
    }
  }
}
