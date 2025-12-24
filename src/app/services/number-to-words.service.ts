import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberToWordsService {

  private ones: string[] = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  private tens: string[] = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  constructor() { }

  private convertWholeNumber(num: number): string {
    if (num === 0) {
      return 'Zero';
    }

    let words = '';

    // Crore (10 million)
    let crore = Math.floor(num / 10000000);
    num %= 10000000;
    if (crore > 0) {
      words += this.convertBelow100(crore) + (crore === 1 ? ' Crore ' : ' Crores ');
    }

    // Lakh (100 thousand)
    let lakh = Math.floor(num / 100000);
    num %= 100000;
    if (lakh > 0) {
      words += this.convertBelow100(lakh) + (lakh === 1 ? ' Lakh ' : ' Lakhs ');
    }

    // Thousand (1000)
    let thousand = Math.floor(num / 1000);
    num %= 1000;
    if (thousand > 0) {
      words += this.convertBelow100(thousand) + ' Thousand ';
    }

    // Hundreds (100)
    let hundred = Math.floor(num / 100);
    num %= 100;
    if (hundred > 0) {
      words += this.convertBelow100(hundred) + ' Hundred ';
    }

    // Below 100
    if (num > 0) {
      words += this.convertBelow100(num);
    }

    return words.trim();
  }

  private convertBelow100(num: number): string {
    if (num < 20) {
      return this.ones[num];
    } else {
      let tensPart = Math.floor(num / 10);
      let onesPart = num % 10;
      return this.tens[tensPart] + (onesPart > 0 ? ' ' + this.ones[onesPart] : '');
    }
  }

  private convertPaise(num: number): string {
    return num > 0 ? 'and ' + this.convertBelow100(num) + ' Paise' : '';
  }

  convertToWords(amount: number): string {
    let wholeNumber = Math.floor(amount);
    let paise = Math.round((amount - wholeNumber) * 100);

    let words = this.convertWholeNumber(wholeNumber);

    // Check if there's paise and append 'and [paise] Paise'
    if (paise > 0) {
      words += ' ' + this.convertPaise(paise);
    }

    // return words.trim();
    return (words +' only').trim();
  }
}
