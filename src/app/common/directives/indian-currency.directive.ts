import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Renderer2
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Directive({
  selector: '[appIndianCurrency]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IndianCurrencyDirective),
      multi: true
    }
  ]
})
export class IndianCurrencyDirective implements ControlValueAccessor {
  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  writeValue(value: any): void {
    const formatted = this.formatToIndianCurrency(value?.toString() || '');
    this.renderer.setProperty(this.el.nativeElement, 'value', formatted);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let rawValue: string = event.target.value;

    // Remove commas first
    rawValue = rawValue.replace(/,/g, '');

    // Allow only digits and one dot
    const cleaned = this.cleanInput(rawValue);

    // Update the model value
    const numericValue = parseFloat(cleaned);
    this.onChange(isNaN(numericValue) ? null : numericValue);

    // Format for display
    const formatted = this.formatToIndianCurrency(cleaned);
    this.renderer.setProperty(this.el.nativeElement, 'value', formatted);
  }

  private cleanInput(input: string): string {
    // Remove all non-digit and non-dot characters
    input = input.replace(/[^0-9.]/g, '');

    // Allow only the first dot, remove others
    const firstDotIndex = input.indexOf('.');
    if (firstDotIndex !== -1) {
      const beforeDot = input.substring(0, firstDotIndex + 1);
      const afterDot = input.substring(firstDotIndex + 1).replace(/\./g, ''); // remove extra dots
      return beforeDot + afterDot;
    }

    return input;
  }

  private formatToIndianCurrency(value: string): string {
    if (!value) return '';

    const [intPart, decimalPart] = value.split('.');
    const cleanedInt = intPart.replace(/^0+/, '') || '0';

    const lastThree = cleanedInt.slice(-3);
    const otherNumbers = cleanedInt.slice(0, -3);

    const formatted =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') +
      (otherNumbers ? ',' : '') + lastThree;

    return  decimalPart != null ? `${formatted}.${decimalPart}` : formatted;
  }
}
