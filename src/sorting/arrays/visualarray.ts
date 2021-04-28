import * as Util from "../util";

export interface VisualArray {
    readonly length: number;

    get(index: number): number;
    swap(first: number, second: number): void;
    move(from: number, to: number): void;
    /**
     * @param start - inclusive
     */
    subarray(start: number, end: number): VisualArray;
    compareIndexes(first: number, second: number): ComparisonResult;
    compareValues(first: number, second: number): ComparisonResult;

    /**
     * @param temporary - whether the highlighting will clear on the next frame. Default value is true
     * @returns for chaining
     */
    mark(index: number, highlighting: string, temporary?: boolean): VisualArray;
    markIndex(index: number, temporary?: boolean): VisualArray;
    markComparison(first: number, second: number, temporary?: boolean): VisualArray;
    unmark(index: number): VisualArray;
    clearHighlighting(): void;

    updateAndDelay(): Promise<void>;
    update(): void;
}

/**
 * Implements most of VisualArray
 */
export abstract class DrawnArray implements VisualArray {
    private array: number[];
    readonly stats: Stats = new Stats();
    readonly highlighting: Map<number, HighlightedIndex> = new Map();
    /**
     * @param array - to be copied
     */
    constructor(
        array: number[],
        public delay: number = 10,
        public theme: HighlightingTheme = { DEFAULT: "white", INDEX: "aqua", COMPARISON: "green" }
    ) {
        this.array = array.slice();
    }

    get length() {
        return this.array.length;
    }

    get(index: number) {
        this.stats.reads++;
        return this.array[index];
    }

    swap(first: number, second: number) {
        this.stats.swaps++;
        [this.array[first], this.array[second]] = [this.array[second], this.array[first]];
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

    compareIndexes(first: number, second: number) {
        return this.compareValues(this.get(first), this.get(second));
    }

    compareValues(first: number, second: number) {
        this.stats.comparisons++;
        return new ComparisonResult(first - second);
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

    async updateAndDelay(): Promise<void> {
        this.update();
        await Util.delay(this.delay);
    }

    abstract update(): void;
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
    compareIndexes(first: number, second: number): ComparisonResult {
        return this.parent.compareIndexes(this.getParentIndex(first), this.getParentIndex(second));
    }
    compareValues(first: number, second: number): ComparisonResult {
        return this.parent.compareValues(first, second);
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

    updateAndDelay(): Promise<void> {
        return this.parent.updateAndDelay();
    }
    update() {
        this.parent.update();
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
    get isGreaterOrEqual() {
        return this.result >= 0;
    }
    get isLess() {
        return this.result < 0;
    }
    get isLessOrEqual() {
        return this.result <= 0;
    }
    get isEqual() {
        return this.result == 0;
    }
}
