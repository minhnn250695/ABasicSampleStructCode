import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';

// directive
import { ComponentHostDirective } from '../../directives/component-host.directive';

@Component({
  selector: 'app-mobile-detect',
  templateUrl: './mobile-detect.component.html',
  styleUrls: ['./mobile-detect.component.css']
})
export abstract class MobileDetectComponent implements OnInit, OnDestroy {
  @ViewChild(ComponentHostDirective) host: ComponentHostDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    let component = this.getComponent();
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    let viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();
    viewContainerRef.createComponent(componentFactory);
  }

  ngOnDestroy() { }

  abstract mobileComponent(): any
  abstract deskComponent(): any

  private isMobile(): boolean {
    return navigator.userAgent.includes("Mobile");
  }

  private getComponent(): any {
    return this.isMobile() ? this.mobileComponent() : this.deskComponent();
  }
}
