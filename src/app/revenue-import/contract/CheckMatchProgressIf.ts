// model
import { Entity } from './../models/entity.model';

export interface CheckMatchProgressIf {
    /**
     * Match progress is done and successful 
     * there is no missing data
     */
    onMatchSuccess(list: Entity[]);

    /**
     * Match progress is done
     * but missing some data
     */
    onMatchMissData(list: Entity[], errorCode: number, msg: string);

    /**
     * Match progress get error 
     */
    onCheckError(error: string);
}