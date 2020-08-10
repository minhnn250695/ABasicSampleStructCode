import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'mobilePhone'})
export class MobilePhonePipe implements PipeTransform{
  transform(value: string): string{
    let num = value.split(' ').join('');
    let part1 = num.substr(0,4);
    let part2 = num.substr(4,3);
    let part3 = num.substr(7,3);
    return part1 + " " + part2 + " " + part3;
  }
}