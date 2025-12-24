import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BorderColorService {

  constructor() { }


  getColor(value: number): string {
    // console.log('Days:', value);

    if (value > 60) {
      return 'green';
    } else if (value <= 60 && value > 30) {
      return '#e9cf05';
    } else if (value <= 30 && value > 1) {
      return '#ff9800';
    } else if (value <= 1 && value > -7) {
      return 'red';
    } else if (value <= -7) {
      return 'red';
    } else {
      return 'gray';
    }
  }

  getClassName(value: number): string {
    // console.log('Days:', value);

    if (value <= 60 && value > 30) {
      return 'yellow-highlight';
    } else if (value <= 30 && value > 1) {
      return 'orange-highlight';
    } else if (value <= 1 && value > -7) {
      return 'red-highlight';
    } else if (value <= -7) {
      return 'red-highlight';
    } else {
      return '';
    }
  }
}
