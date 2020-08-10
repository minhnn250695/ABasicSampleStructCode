import { ClassFundData } from './class-fund-data.model';
import { Entity } from './../common/entity.model';
import { PlatFormData } from '../plat-form-data/plat-form-info.model';
import { Member } from './member.model';

export class ClassManualMatch {
    Client: Entity<ClassFundData>[] = [];
    ClientAsset: Entity<PlatFormData>[] = [];
    Member: Entity<Member>[] = [];
}