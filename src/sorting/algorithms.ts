import { delay } from './util';
import { DummyVisualArray, VisualArray } from './visualarray';

// Exports are at the bottom to avoid forward delarations

export type SortingImplementation = (array: VisualArray) => Promise<VisualArray>;
export type SortingAlgorithm = {
    description: string
    implementation: SortingImplementation;
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
 As a side effect of this, the largest values "bubble" to the top. The cost of using this algorithm scales exponentially with a time complexity of O(n^2).
 This algorithm splits the array into 2 sections: sorted and unsorted. The space complexity is O(1)`
);

const bubbleSort: SortingImplementation = async (array) => {
    for (let i = 0; i < array.length - 1; i++) {
        const sortedIndex = array.length - i - 1;
        array.markIndex(sortedIndex, false);

        let swapped = false;

        for (let j = 0; j < sortedIndex; j++) {
            await array.markComparison(j, j + 1).drawAndDelay();
            if (array.compare(j, j + 1).isGreater) {
                array.swap(j, j + 1);
                swapped = true;
            }
        }

        array.unmark(sortedIndex);

        if (!swapped) {
            return array;
        }
    }
    return array;
}

const selectionSortDescription = oneline(
`Selection sort sorts by finding the smallest value and bringing it to the beginning.
 Similar to bubble sorting, it splits the array into a sorted side and an unsorted side.
 It swaps less compared to bubble sorting, as it only swaps after searching the entire unsorted subarray.
 The time complexity is O(n^2) and the space complexity is O(1).`
);

const selectionSort: SortingImplementation = async (array) => {
    for (let i = 0; i < array.length - 1; i++) {
        let minIndex = i;

        array.markIndex(i, false);

        for (let j = i + 1; j < array.length; j++) {
            await array.markComparison(minIndex, j).drawAndDelay();
            if (array.compare(j, minIndex).isLess) {
                minIndex = j;
            }
        }
        
        await array.markIndex(minIndex).drawAndDelay();
        array.swap(i, minIndex);

        array.unmark(i);
    }
    return array;
}

const insertionSortDescription: string = oneline(
`Insertion sort is a common algorithm used to sort cards in real life.
 The array is split into 2 sections, a (relatively) sorted and unsorted subarray.
 Elements are taken from the unsorted side and are inserted in the sorted side in order.
 This implementation uses binary search.
 Time complexity is O(n^2) and space complexity is O(1)`
);

// ! does not work LMAO
const insertionSort: SortingImplementation = async (array) => {
    for (let i = 1; i < array.length; i++) {
        array.move(i, await binarySearch(array, i, 0, i - 1));
    }
    return array;
}

// ! BUGGED
/**
 * @param min - inclusive
 * @param max - inclusive
 * @returns index that element should be inserted in
 */
async function binarySearch(array: VisualArray, index: number, min: number = 0, max: number = array.length): Promise<number> {
    array.markIndex(min).markIndex(max);
    
    if (min >= max) {
        await array.markComparison(index, min).drawAndDelay();
        return (array.compare(index, min).isLess) ? min : min + 1;
    }

    const mid = Math.round((min + max) / 2);
    const comp = array.compare(index, mid);
    await array.markComparison(index, mid).drawAndDelay();

    if (comp.isLess) {
        return binarySearch(array, index, min + 1, max);
    } else {    // comp.isGreater (should be no duplicates in array)
        return binarySearch(array, index, min, max + 1);
    }
}


export const AlgorithmList: {[name: string]: SortingAlgorithm} = {
    'Bubble Sort': {
        description: bubbleSortDescription,
        implementation: bubbleSort
    },
    'Selection Sort': {
        description: selectionSortDescription,
        implementation: selectionSort
    },
    'Insertion Sort': {
        description: insertionSortDescription,
        implementation: insertionSort
    },
    
};

// ! Freezes browser :))))
export namespace Validation {
    const VALIDATION_ERROR_MESSAGE: string = "Array sorted incorrectly";

    async function validate(array: VisualArray): Promise<VisualArray> {
        for (let i = 0; i < array.length - 1; i++) {
            let j = i + 1;
            array.markComparison(i, j).drawAndDelay();
            if (!array.compare(i, j).isLess) {
                throw new Error(VALIDATION_ERROR_MESSAGE);
            }
        }
        return array;
    }

    export function validateAll(): void {
        Object.entries(AlgorithmList).forEach(async ([name, algorithm]) => {
            console.log(`Testing ${name}`);
            
            const array = await Promise.race([
                algorithm.implementation(new DummyVisualArray(100)),
                delay(30 * 1000)
            ]);

            if (array === undefined) {
                console.error(`${name} timed out`);
                console.error(array);
                return;
            }

            try {
                validate(array);
            } catch (e) {
                const errorMessage = (e as Error).message;
                if (errorMessage == VALIDATION_ERROR_MESSAGE) {
                    console.error(`"${name}" sorted incorrectly`);
                    console.error(array);
                } else {
                    console.error(e);
                }
            }
        });
    }
}