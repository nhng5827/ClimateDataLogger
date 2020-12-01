import { Component, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit{
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private http: HttpClient) {
  }

  title = 'ClimateDataLogger';
  displayedColumns = ['date', 'url', 'status'];
  dataResponse = '';
  splitArray = [];
  logObject = {date: '', url: '', status: 200};

  /**
   * Receive data function
   * param res:any, statusText: String, status: any
   * return void
   */
  receiveData(res: any, statusText: string, status: any): void {
    this.dataResponse = res;
    const dataArray = [];
    this.splitArray = this.dataResponse.split(';');
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.splitArray.length - 1; i++) {
      this.logObject = JSON.parse(this.splitArray[i]);
      this.logObject.date = this.reformatDate(this.logObject.date);
      dataArray.push(this.logObject);
    }
    this.dataSource = new MatTableDataSource(dataArray);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  reformatDate(date): string {
    date = date.substring(1, date.length  - 1);
    const tzOffset = date.substr(-5, 5);
    const monthStr = date.substr(3, 3);
    // tslint:disable:object-literal-key-quotes
    const months = {
      'Jan' : '01',
      'Feb' : '02',
      'Mar' : '03',
      'Apr' : '04',
      'May' : '05',
      'Jun' : '06',
      'Jul' : '07',
      'Aug' : '08',
      'Sep' : '09',
      'Oct' : '10',
      'Nov' : '11',
      'Dec' : '12'
    };
    const month = months[monthStr];
    const day = date.substr(0, 2);
    const year = date.substr(7, 4);
    const time = date.substr(12, 8);
    const d = new Date(year + '-' + month + '-' + day + 'T' + time + tzOffset);

    return d.toLocaleString();
  }
  initLog(): void {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'text/plain, */*',
        'Content-Type': 'text/plain' // We send JSON
      }),
      responseType: 'text' as 'json'  // We accept plain text as response.
    };
    this.http.get<any>('https://tds.gisclimatechange.ucar.edu/products/log', httpOptions).subscribe(this.receiveData.bind(this));
  }
  ngAfterViewInit(): void {
    this.initLog();
  }
}
