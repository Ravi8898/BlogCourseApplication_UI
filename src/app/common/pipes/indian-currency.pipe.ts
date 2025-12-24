import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {
  transform(value: number | string, showSymbol: boolean = true): string {
    if (value === null || value === undefined || value === '') return '';

    const strValue = value.toString().replace(/,/g, '');

    // Allow only valid number with at most one dot
    const match = strValue.match(/^-?\d*\.?\d*$/);
    if (!match) return value.toString();

    let [intPart, decimalPart] = strValue.split('.');
    const cleanedInt = intPart.replace(/^0+/, '') || '0';

    const lastThree = cleanedInt.length > 3 ? cleanedInt.slice(-3) : cleanedInt;
    const otherNumbers = cleanedInt.length > 3 ? cleanedInt.slice(0, -3) : '';

    const formatted =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') +
      (otherNumbers ? ',' : '') +
      lastThree;

    // ✅ Keep only n digits after decimal (rounded)
    if (decimalPart) {
      // decimalPart = decimalPart.slice(0, 3); // truncates after 3 digits
      // OR use rounding version below:
      const rounded = Number('0.' + decimalPart).toFixed(2).split('.')[1];
      decimalPart = rounded;
    }
    const result = decimalPart != null ? `${formatted}.${decimalPart}` : formatted;
    return showSymbol ? `₹ ${result}` : result;
  }
}
