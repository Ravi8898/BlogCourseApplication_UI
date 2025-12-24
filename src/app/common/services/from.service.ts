import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }
  trimFormValues(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control && control.value && typeof control.value === 'string') {
        control.setValue(control.value.trim(), { emitEvent: false });
      }
    });
  }

  isFormUpdated(originalValues: any, form: FormGroup): boolean {
    if (!originalValues || typeof originalValues !== 'object') {
      return false; // No changes detected if originalValues is null or undefined
    }
  
    return Object.keys(originalValues).some(key => {
      const formValue = form.get(key)?.value?.toString().trim() || '';
      const originalValue = originalValues[key]?.toString().trim() || '';
      return formValue !== originalValue;
    });
  }
  

}

