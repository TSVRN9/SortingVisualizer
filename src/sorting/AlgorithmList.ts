import VisualArray, { Highlighting } from './VisualArray';

// Exports are at the bottom to avoid forward delarations

function algorithmInfo(
    description: string,
    sort: SortingImplementation
): AlgorithmInfo {
    return {
        description: description,
        sort: sort,
    };
}

/**
 * Removes all newlines from a string
 */
function oneline(str: string) {
    return str.replace(/\n/g, '');
}

// ALGORITHMS

const bubbleSortDescription = oneline(
    `Bubble sort is a simple sorting algorithm that compares 2 adjacent values and swaps them if they're not in relative order.
 As a side effect of this, the largest values "bubble" to the top. 
 The cost of using this algorithm scales exponentially with a time complexity of O(n^2).
 This algorithm splits the array into 2 sections: sorted and unsorted. 
 The space complexity is O(1)`
);

const bubbleSort: SortingImplementation = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
        const sortedIndex = arr.length - i - 1;
        arr.mark(sortedIndex, Highlighting.INDEX, true);

        let swapped = false;

        for (let j = 0; j < sortedIndex; j++) {
            if (arr.compareIndexes(j, j + 1).isGreater) {
                arr.swap(j, j + 1);
                swapped = true;
            }
            arr.takeSnapshot();
        }

        arr.unmark(sortedIndex);

        if (!swapped) {
            return arr;
        }
    }
    return arr;
};

const selectionSortDescription = oneline(
    `Selection sort sorts by finding the smallest value and bringing it to the beginning.
 Similar to bubble sorting, it splits the array into a sorted side and an unsorted side.
 It swaps less compared to bubble sorting, as it only swaps after searching the entire unsorted subarray.
 The time complexity is O(n^2) and the space complexity is O(1).`
);

const selectionSort: SortingImplementation = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;

        for (let j = i + 1; j < arr.length; j++) {
            arr.mark(i, Highlighting.INDEX);
            if (arr.compareIndexes(j, minIndex).isLess) {
                minIndex = j;
            }
            arr.takeSnapshot();
        }
        arr.swap(i, minIndex);

        arr.unmark(i);
    }
    return arr;
};

const insertionSortDescription: string = oneline(
    `Insertion sort is a common algorithm used to sort cards in real life.
 The array is split into 2 sections, a (relatively) sorted and unsorted subarray.
 Elements are taken from the unsorted side and are inserted in the sorted side in order.
 Time complexity is O(n^2) and space complexity is O(1)`
);

const insertionSort: SortingImplementation = (arr) => {
    for (let i = 1; i < arr.length; i++) {
        for (let j = i - 1; j >= 0; j--) {
            if (arr.compareIndexes(j, j + 1).isGreater) {
                arr.swap(j, j + 1);
                arr.takeSnapshot();
            } else {
                arr.takeSnapshot();
                break;
            }
        }
    }
    return arr;
};

const quickSortDescription: string = oneline(
    `Quick sort is a commonly used algorithm with a worst case runtime complexity of n^2.
 Although on average, it has a time complexity of n log n.
 Like the name suggests, quick sort is pretty quick.`
);

const quickSort: SortingImplementation = (arr) => {
    sort();
    return arr;

    /**
     * @param min - inclusive
     * @param max - inclusive
     */
    function sort(min = 0, max = arr.length - 1): void {
        if (arr.compareValues(min, max).isGreaterOrEqual) {
            return;
        }

        const partitionIndex = partition(min, max);

        // sort left and right
        sort(min, partitionIndex - 1);
        sort(partitionIndex + 1, max);
    }

    /**
     * @param min - inclusive
     * @param max - inclusive
     * @returns index of pivot
     */
    function partition(min: number, max: number): number {
        // const pivotIndex = max;
        let i = min - 1; // immediately incremented

        for (let j = min; j < max; j++) {
            arr.takeSnapshot();
            if (arr.compareIndexes(j, max).isLessOrEqual) {
                i++;
                arr.swap(i, j);
            }
        }

        // new pivotIndex thing
        i++;
        arr.swap(i, max);
        return i;
    }
};

// class to allow use of webworker
export class AlgorithmList {
    readonly list: Record<string, AlgorithmInfo> = {
        'Bubble Sort': algorithmInfo(bubbleSortDescription, bubbleSort),
        'Selection Sort': algorithmInfo(
            selectionSortDescription,
            selectionSort
        ),
        'Insertion Sort': algorithmInfo(
            insertionSortDescription,
            insertionSort
        ),
        'Quick Sort': algorithmInfo(quickSortDescription, quickSort),
    };

    get names() {
        return Object.keys(this.list);
    }

    get length() {
        return this.names.length;
    }
}

export type SortingImplementation = (array: VisualArray) => VisualArray;
export type AlgorithmInfo = {
    name: string;
    description: string;
    sort: SortingImplementation;
};