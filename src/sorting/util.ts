//  functions that just make life easier :)

export function generateShuffledArray(size: number) {
    // [1, 2, 3, 4...]
    let arr = generateArray(size);

    // fisher yates algorithm
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Generates sorted array
 * @param end - exclusive
 * @returns - array incrementing up by 1
 */
export function generateArray(size: number = 100): number[] {
    let array: number[] = [];
    for (let i = 1; i <= size; i++) {
        array.push(i);
    }
    return array;
}

export function delay(ms = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
