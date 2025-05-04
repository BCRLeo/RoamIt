/**
 * Creates an array of values from `start` (inclusive) to `stop` (exclusive), with increments of `step`.
 */
export function arrayRange(start: number, stop: number, step: number =  1) {
    if (!Number.isInteger(start) || !Number.isInteger(stop) || !Number.isInteger(step)) {
        throw new Error("All arguments must be integer values.");
    }

    return Array.from(
        { length: (stop - start) / step + 1 },
        (_value, index) => start + index * step
    );
}