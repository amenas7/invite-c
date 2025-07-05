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

}
