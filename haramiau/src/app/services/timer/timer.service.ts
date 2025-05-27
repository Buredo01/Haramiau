import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { STATE_NAMES } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timer: any = null;
  private remainingTime = new BehaviorSubject<number>(0);
  public remainingTime$: Observable<number> = this.remainingTime.asObservable();

  private gmUpdateSwitch = new Subject<void>();
  public gmSwitch$: Observable<void> = this.gmUpdateSwitch.asObservable();

  private sendPassUpdate = new Subject<void>();
  public sendPass$: Observable<void> = this.sendPassUpdate.asObservable();

  startTimer(seconds: number, state: string) {
    this.clearTimer();
    this.remainingTime.next(seconds);

    this.timer = setInterval(() => {
      const current = this.remainingTime.value;
      if (current > 0) {
        this.remainingTime.next(current - 1);
      } else {
        switch (state) {
          case STATE_NAMES.HINT_UPDATE:
            this.sendPassUpdate.next();
            break;
          case STATE_NAMES.TIP_UPDATE:
            this.gmUpdateSwitch.next();
            break;
          case STATE_NAMES.NEXT_ROUND_UPDATE:
            this.gmUpdateSwitch.next();
            break;
          case STATE_NAMES.CHOOSE_WORD_UPDATE:
            this.gmUpdateSwitch.next();
            break;
          case STATE_NAMES.CHOOSEN_WORD_UPDATE:
            this.gmUpdateSwitch.next();
            break;
          case STATE_NAMES.SHOW_WORD:
            break;
        }
        this.clearTimer();
      }
    }, 1000);
  }

  stopTimer() {
    this.clearTimer();
    this.remainingTime.next(0);
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
