import { printLine } from './modules/print';

var url = window.location.href;

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');
console.log('Current URL: ', url);


printLine("Using the 'printLine' function from the Print Module");
