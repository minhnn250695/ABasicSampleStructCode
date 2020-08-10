
import { Entity } from './../models/entity.model';
import { RevenueEntity } from './../models/revenue-entity.model';

export interface RevenueMatchIf {
    onInitDataDone();
    onGetEntityDetailDone(entity: Entity);
    onManualMatchSuccess(entity: RevenueEntity, isMatch: boolean);
    onSubmitImportSuccess();
    onError(error: string);
    onHideLoading();
}