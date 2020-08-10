import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MaterialDefModule } from '../material.module';
import { LoaderComponent } from './loader.component';
import { LoaderService } from './loader.service';
// import { CommonViewModule } from '../../../common-view.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialDefModule,
    // CommonViewModule
  ],
  exports: [
    LoaderComponent
  ],
  declarations: [LoaderComponent]
})
export class LoaderModule {
  static forRoot(): ModuleWithProviders {
    return {
        ngModule: LoaderModule,
        providers: [
            LoaderService
          ]
    };
}
 }
