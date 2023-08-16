export interface Employee {
  employeeId: string;
  projectId: string;
  dateFrom: Date;
  dateTo: Date;
}

export interface BestPair {
  firstEmployeeId: string;
  secondEmployeeId: string;
  projectId: string;
  daysWorked: number;
}
