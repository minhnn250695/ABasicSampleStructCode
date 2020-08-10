import { Pairs } from '../../revenue-import/models';
import { GoalsModel } from './goals.model';

export interface GoalModalObject {
    mode: "add" | "edit" | "view";
    title: string;
    assetList: Pairs[];
    debtList: Pairs[];
    content: GoalsModel;
}