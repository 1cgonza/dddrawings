import { hexToRgb } from 'dddrawings';

// some nice color palettes
// rusted desert metal. winter, new mexico
let goodcolor = [
  '#3a242b',
  '#3b2426',
  '#352325',
  '#836454',
  '#7d5533',
  '#8b7352',
  '#b1a181',
  '#a4632e',
  '#bb6b33',
  '#b47249',
  '#ca7239',
  '#d29057',
  '#e0b87e',
  '#d9b166',
  '#f5eabe',
  '#fcfadf',
  '#d9d1b0',
  '#fcfadf',
  '#d1d1ca',
  '#a7b1ac',
  '#879a8c',
  '#9186ad',
  '#776a8e',
];

goodcolor = goodcolor.map((color) => {
  const rgb = hexToRgb(color);
  return [rgb.r, rgb.g, rgb.b];
});

export default goodcolor;
