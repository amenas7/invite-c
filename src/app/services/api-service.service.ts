import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  constructor(private http: HttpClient) { }

  registerData(params: any): any {

    const options = { observe: 'response' as 'body' };

    return this.http.post(`https://alvaro-y-aylin.com/api/send_data.php`, params, options);

  }

  // Enviar datos a Google Sheets
  sendToGoogleSheets(data: any): Observable<any> {
    const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbwB71f3yV8gp7EIARXOdzhDmkUk_PO-gio1FPQ1A9Svm0vJYi7R2-oedOy6kjBRbg/exec'; // Reemplaza por tu URL de Apps Script
    return this.http.post(googleSheetsUrl, data);
  }

}
