import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyDecimal]'
})
export class OnlyDecimalDirective {
  constructor() {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Delete'
    ];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    const inputElement = event.target as HTMLInputElement;
    const currentValue = inputElement.value;

    if (event.key === '.' && !currentValue.includes('.')) {
      return;
    }

    const isDigit = /^[0-9]$/.test(event.key);
    if (!isDigit) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedInput = event.clipboardData?.getData('text') ?? '';
    if (!/^\d*\.?\d*$/.test(pastedInput)) {
      event.preventDefault();
    }
  }
}
