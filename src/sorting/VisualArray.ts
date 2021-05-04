export default class VisualArray {
    // cleared on takeSnapshot()
    private highlighting: Map<number, HighlightingInfo> = new Map();
    readonly stats: ArrayStats = new ArrayStats();

    constructor(
        private array: number[],
        public onSnapshot: (
            snapshot: ArraySnapshot,
            array: VisualArray
        ) => void = () => {}
    ) {}

    get length() {
        return this.array.length;
    }

    get(index: number): number {
        this.stats.reads++;

        // no highlighting

        return this.array[index];
    }
    swap(first: number, second: number): void {
        this.stats.swaps++;

        this.mark(first, Highlighting.MOVE).mark(second, Highlighting.MOVE);

        [this.array[first], this.array[second]] = [
            this.get(second),
            this.get(first),
        ];
    }
    move(from: number, to: number): void {
        this.stats.moves++;

        this.mark(to, Highlighting.MOVE);

        const temp = this.get(from);
        this.array.splice(from, 1);
        this.array.splice(to, 0, temp);
    }

    compareIndexes(first: number, second: number): ComparisonResult {
        this.mark(first, Highlighting.COMPARISON).mark(
            second,
            Highlighting.COMPARISON
        );

        return this.compareValues(this.get(first), this.get(second));
    }
    compareValues(first: number, second: number): ComparisonResult {
        this.stats.comparisons++;
        return new ComparisonResult(first - second);
    }

    mark(
        index: number,
        highlighting: Highlighting,
        permanent: boolean = false
    ): VisualArray {
        if (!this.highlighting.get(index)?.isPermanent) {
            this.highlighting.set(
                index,
                new HighlightingInfo(highlighting, permanent)
            );
        }
        return this;
    }
    unmark(index: number): VisualArray {
        this.highlighting.delete(index);
        return this;
    }

    takeSnapshot(): void {
        const snapshot = this.getSnapshot();

        this.highlighting.forEach((highlighting, key) => {
            if (!highlighting.isPermanent) {
                this.highlighting.delete(key);
            }
        });

        this.onSnapshot(snapshot, this);
    }

    getSnapshot(): ArraySnapshot {
        return new ArraySnapshot(this.array, this.highlighting);
    }
}

export class ArraySnapshot {
    readonly array: Readonly<number[]>;
    readonly highlighting: Readonly<Map<number, HighlightingInfo>>;

    constructor(array: number[], highlighting: Map<number, HighlightingInfo>) {
        this.array = array.slice();
        this.highlighting = new Map(highlighting);
    }
}

/**
 * Represents statistics of an array
 */
export class ArrayStats {
    reads: number = 0;
    swaps: number = 0;
    moves: number = 0;
    comparisons: number = 0;
}

// colors
export enum Highlighting {
    DEFAULT = 'black',
    INDEX = 'blue',
    COMPARISON = 'green',
    MOVE = 'red',
}

export class HighlightingInfo {
    constructor(
        readonly type: Highlighting,
        readonly isPermanent: boolean = true
    ) {}
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
