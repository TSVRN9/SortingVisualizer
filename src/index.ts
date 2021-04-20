import * as $ from 'jquery';
import { AlgorithmList, Validation } from './sorting/algorithms';
import { generateShuffledArray } from './sorting/util';
import { VisualArrayImplementation } from './sorting/visualarray';

let canvas: HTMLCanvasElement = $('canvas').get(0) as HTMLCanvasElement;

canvas.width = window.innerWidth * .9;
canvas.height = window.innerHeight * .9;

const algorithmNames = Object.keys(AlgorithmList);
let array = new VisualArrayImplementation(generateShuffledArray(100), canvas, 10);

Validation.validateAll();