

import { InsuranceInfo } from './insurance-info.model';

export class TotalInsuranceInfo {
    private map: Map<string, InsuranceInfo[]> = new Map();
    
        getInsuranceInfos(keys?: string[]) {
            let newKeys = keys || Array.from(this.map.keys());
            if (!newKeys)  return [];
            
            let results: InsuranceInfo[] = [];

            newKeys.forEach(id => {
                let list = this.get(id);
                results = results.concat(list || []);
            });
            return results;
        }
    
        add(id: string, data: InsuranceInfo[]) {
            this.map.set(id, data);
        }
    
        remove(id: string) {
            this.map.delete(id);
        }
    
        get(id): InsuranceInfo[] {
            return this.map ? this.map.get(id) : null;
        }
    
        clear() {
            this.map.clear()
        }
}