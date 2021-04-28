import { VisualArray } from "./arrays/visualarray";

// Exports are at the bottom to avoid forward delarations

export type SortingAlgorithm = (array: VisualArray) => Promise<VisualArray>;
export type SortingInfo = {
    description: string;
    sort: SortingAlgorithm;
};

/**
 * Removes all newlines from a string
 */
function oneline(str: string) {
    return str.replace(/\n/g, "");
}

// ALGORITHMS

const bubbleSortDescription = oneline(
    `Bubble sort is a simple sorting algorithm that compares 2 adjacent values and swaps them if they're not in relative order.
 As a side effect of this, the largest values "bubble" to the top. 
 The cost of using this algorithm scales exponentially with a time complexity of O(n^2).
 This algorithm splits the array into 2 sections: sorted and unsorted. 
 The space complexity is O(1)`
);

const bubbleSort: SortingAlgorithm = async (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
        const sortedIndex = arr.length - i - 1;
        arr.markIndex(sortedIndex, false);

        let swapped = false;

        for (let j = 0; j < sortedIndex; j++) {
            await arr.markComparison(j, j + 1).updateAndDelay();
            if (arr.compareIndexes(j, j + 1).isGreater) {
                arr.swap(j, j + 1);
                swapped = true;
            }
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

const selectionSort: SortingAlgorithm = async (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;

        arr.markIndex(i, false);

        for (let j = i + 1; j < arr.length; j++) {
            await arr.markComparison(minIndex, j).updateAndDelay();
            if (arr.compareIndexes(j, minIndex).isLess) {
                minIndex = j;
            }
        }

        await arr.markIndex(minIndex).updateAndDelay();
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

const insertionSort: SortingAlgorithm = async (arr) => {
    for (let i = 1; i < arr.length; i++) {
        for (let j = i - 1; j >= 0; j--) {
            await arr.markComparison(j, j + 1).updateAndDelay();
            if (arr.compareIndexes(j, j + 1).isLess) {
                arr.swap(j, j + 1);
            } else {
                break;
            }
        }
    }
    return arr;
};

const quickSortDescription: string = oneline(
    `Quick sort is a commonly used algorithm with a worst case runtime complexity of n^2.
 Although on average, it has a time complexity of n log n. `
);

const quickSort: SortingAlgorithm = async (arr) => {
    await sort();
    return arr;

    /**
     * @param min - inclusive
     * @param max - inclusive
     */
    async function sort(min = 0, max = arr.length - 1): Promise<void> {
        if (arr.compareValues(min, max).isGreaterOrEqual) {
            return;
        }

        const partitionIndex = await partition(min, max);

        // sort left and right
        await sort(min, partitionIndex - 1);
        await sort(partitionIndex + 1, max);
    }

    /**
     * @param min - inclusive
     * @param max - inclusive
     * @returns index of pivot
     */
    async function partition(min: number, max: number): Promise<number> {
        // const pivotIndex = max;
        let i = min - 1; // immediately incremented

        for (let j = min; j < max; j++) {
            await arr.markComparison(j, max).updateAndDelay();
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

// ! Broken
/**
 * @param min - inclusive
 * @param max - inclusive
 * @returns index that element should be inserted in
 */
async function binarySearch(
    array: VisualArray,
    index: number,
    min: number = 0,
    max: number = array.length
): Promise<number> {
    array.markIndex(min).markIndex(max);

    if (min >= max) {
        await array.markComparison(index, min).updateAndDelay();
        return array.compareIndexes(index, min).isLess ? min : min + 1;
    }

    const mid = Math.round((min + max) / 2);
    const comp = array.compareIndexes(index, mid);
    await array.markComparison(index, mid).updateAndDelay();

    if (comp.isLess) {
        return binarySearch(array, index, min + 1, max);
    } else {
        // comp.isGreater (should be no duplicates in array)
        return binarySearch(array, index, min, max + 1);
    }
}

export const AlgorithmList: { [name: string]: SortingInfo } = {
    "Bubble Sort": {
        description: bubbleSortDescription,
        sort: bubbleSort,
    },
    "Selection Sort": {
        description: selectionSortDescription,
        sort: selectionSort,
    },
    "Insertion Sort": {
        description: insertionSortDescription,
        sort: insertionSort,
    },
    "Quick Sort": {
        description: quickSortDescription,
        sort: quickSort,
    },
};
