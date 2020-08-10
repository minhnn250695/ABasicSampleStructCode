import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class FfRouterService {

  constructor(private router: Router) { }

  
  gotoCheckProgressPage() {
    // goto check-match-progress page
    this.router.navigate(["/revenue/check-progress"])
  }

  gotoMatchCompletedPage() {
    this.router.navigate(["/revenue/match-completed"]);
  }

  gotoUploadFilePage() {
    this.router.navigate(["/revenue/upload"]);
  }
}
