import * as Util from './util';
import { generateShuffledArray } from './util';

export interface VisualArray {
    readonly length: number;

    get(index: number): number;
    swap(first: number, second: number): void;
    move(from: number, to: number): void;
    /**
     * @param start - inclusive
     * @param end - exclusive
     */
    subarray(start: number, end: number): VisualArray;
    compare(first: number, second: number): ComparisonResult;

    /**
     * @param temporary - whether the highlighting will clear on the next frame. Default value is true
     * @returns for chaining
     */
    mark(index: number, highlighting: string, temporary?: boolean): VisualArray;
    markIndex(index: number, temporary?: boolean): VisualArray;
    markComparison(first: number, second: number, temporary?: boolean): VisualArray;
    unmark(index: number): VisualArray;
    clearHighlighting(): void;

    drawAndDelay(): Promise<void>;
    draw(): void;
}

/**
 * Current Implementation
 */
export class CanavasVisualArray implements VisualArray {
    readonly context: CanvasRenderingContext2D;
    readonly stats: Stats = new Stats();

    private array: number[];
    private highlighting: Map<number, HighlightedIndex> = new Map();

    /**
     * @param array - to be copied
     */
    constructor(
        array: number[], 
        readonly canvas: HTMLCanvasElement, 
        public delay: number = 10, 
        public theme: HighlightingTheme = { DEFAULT: 'white', INDEX: 'aqua', COMPARISON: 'green' }
        ) {
        this.array = array.slice();

        let context = canvas.getContext('2d');
        if (context == null) {
            throw new Error('Canvas context is null! Is canvas not supported?');
        }
        this.context = context;
    }

    get length() {
        return this.array.length;
    }

    get(index: number) {
        // update stats
        this.stats.reads++;
        
        return this.array[index];
    }

    swap(first: number, second: number) {
        [this.array[first], this.array[second]] = [this.array[second], this.array[first]];
        
        // update stats
        this.stats.swaps++;
    }
    
    move(from: number, to: number) {
        let value = this.array[from];
        this.array.splice(from, 1);
        this.array.splice(to, 0, value);

        // update stats
        this.stats.moves++;
    }

    subarray(start: number, end: number): VisualArray {
        return new SubVisualArray(this, start, end);
    }
    
    compare(first: number, second: number) {
        // update stats
        this.stats.comparisons++;

        return new ComparisonResult(this.array[first] - this.array[second]);
    }

    mark(index: number, highlighting: string, temporary: boolean = true) {
        // prevents overriding permanent highlighting
        const currentHighlighting = this.highlighting.get(index);
        if (currentHighlighting === undefined || currentHighlighting.isTemporary) {
            this.highlighting.set(index, new HighlightedIndex(index, highlighting, temporary));
        }
        return this;
    }

    /**
     * Equivalent to `mark(index, theme.INDEX, temporary)`
     * @returns for chaining
     */
    markIndex(index: number, temporary: boolean = true) {
        this.mark(index, this.theme.INDEX, temporary);
        return this;
    }

    /**
     * Equivalent to `mark(first, theme.INDEX, temporary).mark(second, theme.INDEX, temporary)`
     * @returns for chaining
     */
    markComparison(first: number, second: number, temporary: boolean = true) {
        this.mark(first, this.theme.COMPARISON, temporary).mark(second, this.theme.COMPARISON, temporary);
        return this;
    }

    unmark(index: number) {
        this.highlighting.delete(index);

        return this;
    }

    // for debugging
    getHighlighting(index: number) {
        return this.highlighting.get(index);
    }

    clearHighlighting() {
        this.highlighting.clear();

        return this;
    }

    async drawAndDelay(): Promise<void> {
        this.draw();
        await Util.delay(this.delay);
    }

    // poorly optimized code
    draw(): void {
        const self = this;

        const length = this.length;
        const context = this.context;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // create copy
        const highlighting = new Map(this.highlighting);

        window.requestAnimationFrame(drawAll);

        /**
         * Should only be called on the first frame or canvas resize
         */
        function drawAll() {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
    
            // prevent gaps in the bars by starting the rectangle where the last one ended
            let x = 0;

            self.array.forEach((value, index) => {
                const hIndex = highlighting.get(index);
                
                // mutiply then divide for extra precision
                const nextX = Math.round((canvasWidth * (index + 1)) / length);
                const width = nextX - x;
                const height = (canvasHeight * value) / length;

                drawRectangle(
                    x, 0, width, height,
                    hIndex?.highlighting || self.theme.DEFAULT
                );

                if (hIndex?.isTemporary) {
                    self.unmark(index);
                }

                // update x
                x = nextX;
            });
        }

        /**
         * for internal use
         * @param y - starts from the bottom of the canvas
         */
        function drawRectangle(x: number, y: number, w: number, h: number, style: string) {
            context.fillStyle = style;
            context.fillRect(x, canvasHeight - y - h, w, h);
        }
    }
}

/**
 * For testing algorithms
 */
export class DummyVisualArray implements VisualArray {
    private array: number[];

    constructor(size: number) {
        this.array = generateShuffledArray(size);
    }

    get length() {
        return this.array.length
    }

    get(index: number): number {
        return this.array[index];
    }
    swap(first: number, second: number): void {
        [this.array[first], this.array[second]] = [this.array[second], this.array[first]];
    }
    move(from: number, to: number): void {
        let value = this.array[from];
        this.array.splice(from, 1);
        this.array.splice(to, 0, value);
    }
    subarray(start: number, end: number): VisualArray {
        return new SubVisualArray(this, start, end);
    }
    compare(first: number, second: number): ComparisonResult {
        return new ComparisonResult(this.array[first] - this.array[second]);
    }

    
    mark(_index: number, _highlighting: string, _temporary?: boolean): VisualArray {
        return this;
    }
    markIndex(_index: number, _temporary?: boolean): VisualArray {
        return this;
    }
    markComparison(_first: number, _second: number, _temporary?: boolean): VisualArray {
        return this;
    }
    unmark(_index: number): VisualArray {
        return this;
    }
    clearHighlighting() {}

    async drawAndDelay(): Promise<void> {}
    draw() {}
}

/**
 * Acts as a seperate array but references a parent
 */
export class SubVisualArray implements VisualArray {
    constructor(readonly parent: VisualArray, readonly start: number, readonly end: number) {}

    get length() {
        return this.end - this.start;
    }

    get(index: number): number {
        return this.parent.get(this.getParentIndex(index));
    }
    swap(first: number, second: number): void {
        this.parent.swap(this.getParentIndex(first), this.getParentIndex(second));
    }
    move(from: number, to: number): void {
        this.parent.move(this.getParentIndex(from), this.getParentIndex(to));
    }
    subarray(start: number, end: number): VisualArray {
        return new SubVisualArray(this.parent, this.getParentIndex(start), this.getParentIndex(end));
    }
    compare(first: number, second: number): ComparisonResult {
        return this.parent.compare(this.getParentIndex(first), this.getParentIndex(second));
    }

    mark(index: number, highlighting: string, temporary?: boolean): VisualArray {
        return this.parent.mark(this.getParentIndex(index), highlighting, temporary);
    }
    markIndex(index: number, temporary?: boolean): VisualArray {
        return this.parent.markIndex(this.getParentIndex(index), temporary);
    }
    markComparison(first: number, second: number, temporary?: boolean): VisualArray {
        return this.parent.markComparison(this.getParentIndex(first), this.getParentIndex(second), temporary);
    }
    unmark(index: number): VisualArray {
        return this.parent.unmark(this.getParentIndex(index));
    }
    clearHighlighting() {
        this.parent.clearHighlighting();
    }

    drawAndDelay(): Promise<void> {
        return this.parent.drawAndDelay();
    }
    draw() {
        this.parent.draw();
    }

    private getParentIndex(index: number) {
        return this.start + index;
    }
}

/**
 * Represents statistics of an array
 */
export class Stats {
    reads: number = 0;
    swaps: number = 0;
    moves: number = 0;
    comparisons: number = 0;
}

export interface HighlightingTheme {
    DEFAULT: string;
    INDEX: string;
    COMPARISON: string;
}

/**
 * Immutable object representing the highlighting of an index
 */
export class HighlightedIndex {
    constructor(readonly index: number, readonly highlighting: string, readonly isTemporary: boolean) {}
}

/**
 * Convenience class that makes everything pretty ✨
 */
export class ComparisonResult {
    constructor(readonly result: number) {}

    // getters because it looks cleaner imo
    get isGreater() {
        return this.result > 0;
    }
    get isGreaterEqual() {
        return this.result >= 0;
    }
    get isLess() {
        return this.result < 0;
    }
    get isLessEqual() {
        return this.result <= 0;
    }
    get isEqual() {
        return this.result == 0;
    }
}