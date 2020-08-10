import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'birthday' })
export class BirthDayPipe implements PipeTransform {
    transform(value: string): string {
        if(!value) return "N/A"

        let arrString = value.split('-');
        let year = arrString[0];
        let month = arrString[1];
        let day = arrString[2].slice(0, 2);

        return day + "/" + month + "/" + year;
    }
}