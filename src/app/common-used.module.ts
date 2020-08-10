import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

// service
import { FooterService } from './common/components/footer/footer.service';
import { LiveCustomerSupportService } from './common/components/live-customer-support/live-customer-support.service';
import { ScriptLoaderComponent } from './common/components/script-loader/script-loader-component';
import { BackgroundProcessService } from './common/services/background-process.service';
// import { ClientViewService } from './client-view/client-view.service';
import { ConfigService } from './common/services/config-service';
import { FfRouterService } from './common/services/ff-router.service';
import { RefreshService } from './common/services/refresh.service';
import { TemplateManagerService } from './document-generator/template-manager/template-manager.service';
import { FpStorageService } from './local-storage.service';
import { RevenueImportService } from './revenue-import/revenue-import.service';
import { SecurityService } from './security/security.service';
import { HandleErrorMessageService } from './common/services/handle-error.service';

import { CashFlowService} from './client-view/cash-flow/cash-flow.service';
import { ClientInsuranceService } from './client-view/client-insurance/client-insurance.service';
import { ClientAssetService } from './client-view/client-asset/client-asset.service';
import { ClientDebtService } from './client-view/client-debt/client-debt.service';
import { PersonalProtectionService } from './client-view/client-protection/personal-protection.service';
import { ExportFileService } from './common/services/export-file-service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: []
})
export class CommonUsedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CommonUsedModule,
            providers: [
                RevenueImportService,
                FpStorageService,
                FfRouterService,
                SecurityService,
                TemplateManagerService,
                ConfigService,
                FooterService,
                ClientAssetService,
                CashFlowService,
                ClientDebtService,
                ClientInsuranceService,
                PersonalProtectionService,
                ScriptLoaderComponent,
                LiveCustomerSupportService,
                BackgroundProcessService,
                RefreshService,
                HandleErrorMessageService,
                ExportFileService
            ]
        };
    }
}
