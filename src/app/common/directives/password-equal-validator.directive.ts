import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Subscription } from '../../../../node_modules/rxjs';

@Directive({
    selector: '[compare]',
    providers: [{ provide: NG_VALIDATORS, useExisting: EqualValidator, multi: true }]
})
export class EqualValidator implements Validator {
    @Input('compare') controlNameToCompare: string;

    validate(c: AbstractControl): ValidationErrors | null {
        const controlToCompare = c.root.get(this.controlNameToCompare);
        // if (!c.value || c.value.length == 0) {
        //     return null;
        // }
        if (controlToCompare) {
            const subscription: Subscription = controlToCompare.valueChanges.subscribe(() => {
                c.updateValueAndValidity();
                subscription.unsubscribe();
            });
        }
        return controlToCompare && controlToCompare.value !== c.value ? { 'compare': true } : null;
    }
}