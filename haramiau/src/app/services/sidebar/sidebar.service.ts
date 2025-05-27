import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  toggleSidebar(): void {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.value);
  }

  setSidebar(open: boolean): void {
    this.sidebarOpenSubject.next(open);
  }

  private sidebarOpenSubjectright = new BehaviorSubject<boolean>(false);
  sidebarOpenright$ = this.sidebarOpenSubjectright.asObservable();

  toggleSidebarright(): void {
    this.sidebarOpenSubjectright.next(!this.sidebarOpenSubjectright.value);
  }

  setSidebarright(open: boolean): void {
    this.sidebarOpenSubjectright.next(open);
  }
}
