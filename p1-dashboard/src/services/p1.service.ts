import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, switchMap, retry } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class P1Service {
  constructor(private http: HttpClient) {}

  streamData(): Observable<any> {
    return timer(0, 1000).pipe(
      switchMap(() => this.http.get<any>('/api/p1')),
      retry({ delay: 2000 }),
    );
  }
}
