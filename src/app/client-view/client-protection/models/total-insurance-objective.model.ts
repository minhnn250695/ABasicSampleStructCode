
import { InsuranceObjective } from './insurance-objective.model';


export class TotalInsuranceObjective {

    private map: Map<string, InsuranceObjective> = new Map();


    add(id: string, data: InsuranceObjective) {
        this.map.set(id, data);
    }

    remove(id: string) {
        this.map.delete(id);
    }

    get(id): InsuranceObjective {
        return this.map ? this.map.get(id) : null;
    }

    clear() {
        this.map.clear();
    }
}