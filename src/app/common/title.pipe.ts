import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'title'
})
export class TitlePipe implements PipeTransform {

  // transform(value: any, ...args: unknown[]): unknown {
  //   value = value.split('-').join(' ');
  //   return value;
  // }

  transform(value: string): string {
    // console.log('TitlePipe', value);
    
    if (!value) return '';

    let formattedValue = value.split('--').join(' ').split('-').join(' ');

    // if (formattedValue.toLowerCase() === 'cjpc') {
      
    //   return 'CJPC';
    // }


    // return formattedValue
    //   .toLowerCase()
    //   .split(' ')
    //   .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    //   .join(' ');
   const words = formattedValue.toLowerCase().split(' ');
      const transformedWords = words.map(word => {
    if (word === 'cjpc') {
      return 'CJPC';
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  });

  return transformedWords.join(' ');
  }

}
