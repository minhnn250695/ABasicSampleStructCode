import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[componentHost]'
})
export class ComponentHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
