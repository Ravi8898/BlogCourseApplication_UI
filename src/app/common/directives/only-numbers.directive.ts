import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]'
})
export class OnlyNumbersDirective {

  constructor() { }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow: Backspace, Delete, Tab, Escape, Enter, and Arrow keys
    if (
      [8, 9, 13, 27, 37, 38, 39, 40].includes(charCode)
    ) {
      return;
    }

    // Restrict input to only numbers (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
