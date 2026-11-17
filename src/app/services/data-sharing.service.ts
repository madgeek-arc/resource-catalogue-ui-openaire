import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DataSharingService {
  public refreshRequired: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  print() {
    console.log(this.refreshRequired);
  }
}
