import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'homePhone' })
export class HomePhonePipe implements PipeTransform {
    transform(value: string): string {
        let num = value.replace(/[^0-9]/g,"");
        let part1 = num.substr(0, 2);
        let part2 = num.substr(2, 4);
        let part3 = num.substr(6, 4);
        return "("+ part1 + ")" + " " + part2 + " " + part3;
    }
}