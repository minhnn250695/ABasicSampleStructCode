import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { DialogModel } from './DialogModel';


@Injectable()
export class ConfirmationDialogService {

  public response: Subject<boolean> = new Subject<boolean>();
  readonly response$: Observable<any> = this.response.asObservable();
  private modal: Subject<any> = new Subject<any>();
  // tslint:disable-next-line:member-ordering
  readonly modal$: Observable<any> = this.modal.asObservable();

  /**
   * Show modal.
   * Return an Observable<boolean>
   * `true` if user clicks OK,
   * `false` if user clicks Cancel.
   * @param object - An object of `DialogModel`
   */
  public showModal(object: DialogModel): Observable<boolean> {
    this.modal.next(object);
    return this.response$.take(1);
  }

  /**
   * Close modal
   */
  public closeModal() {
    this.modal.next();
  }

}
