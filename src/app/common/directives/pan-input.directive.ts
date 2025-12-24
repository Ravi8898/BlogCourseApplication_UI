import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPanInput]'
})
export class PanInputDirective {

  constructor() { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // Remove any non-alphanumeric characters
    value = value.replace(/[^A-Za-z0-9]/g, '');

    // Restrict input to only PAN format: XXXXX1234X
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Format the PAN input: XXXXX1234X
    if (value.length > 5) {
      value = value.substring(0, 5) + value.substring(5, 9).toUpperCase() + value.charAt(9).toUpperCase();
    }

    // Update the input field with the formatted PAN
    inputElement.value = value.toUpperCase();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    
    // Allow: Backspace, Delete, Tab, Escape, Enter, Arrow keys
    if ([8, 9, 13, 27, 37, 38, 39, 40].includes(charCode)) {
      return;
    }

    // Allow: Uppercase letters (A-Z) and numbers (0-9)
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90)) {
      return;
    }

    // If the input doesn't match allowed values, prevent the default action
    event.preventDefault();
  }
}
