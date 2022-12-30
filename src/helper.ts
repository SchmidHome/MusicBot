type anything = boolean | number | string | object | undefined | null

// UNDEFINED
export function isUndefined(obj: anything): obj is undefined { return obj === undefined }
export function isNotUndefined(obj: anything): obj is Exclude<anything, undefined> { return !isUndefined(obj) }
export function assertIsNotUndefined(obj: anything): asserts obj is Exclude<anything, undefined> {
    if (isUndefined(obj)) {
        throw new Error("obj is undefined")
    }
}

export function isNull(obj: anything): obj is null { return obj === null }
export function isNotNull(obj: anything): obj is Exclude<anything, null> { return !isNull(obj) }
export function assertIsNotNull(obj: anything): asserts obj is Exclude<anything, null> {
    if (isNull(obj)) {
        throw new Error("obj is null")
    }
}

export function isNullOrUndefined(obj: anything): obj is null | undefined { return isNull(obj) || isUndefined(obj) }
export function isNotNullOrUndefined(obj: anything): obj is Exclude<anything, null | undefined> { return !isNullOrUndefined(obj) }
export function assertIsNotNullOrUndefined(obj: anything): asserts obj is Exclude<anything, null | undefined> {
    if (isNullOrUndefined(obj)) {
        throw new Error("obj is null or undefined")
    }
}


// STRING
export function isString(obj: anything): obj is string { return typeof obj === "string" }


export function assertIsMatch(match: RegExpExecArray | null): asserts match is RegExpExecArray {
    if (!match) throw new Error("match is undefined")
}

export function between(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

export function isEqual(a: any, b: any): boolean {
    switch (typeof a) {
        case "boolean":
        case "bigint":
        case "number":
        case "string":
        case "undefined":
            return a === b;
        case "function":
            // eslint-disable-next-line
            if (typeof b === "function") return a == b;
            return false;
        case "object":
            if (a === null || a === undefined || b === null || b === undefined) {
                return b === a;
            }
            if (Array.isArray(a)) {
                if (!Array.isArray(b) || a.length !== b.length) return false;
                return !a.some((ele, index) => !isEqual(ele, b[index]));
            }
            if (a instanceof Date) {
                if (!(b instanceof Date)) return false;
                return a.getTime() === b.getTime();
            }

            if (
                Array.isArray(b) ||
                (typeof b === "object" &&
                    "getTime" in b &&
                    typeof b?.getTime === "function") ||
                b === undefined ||
                b === null
            )
                return false;

            return isEqual(
                // sort keys
                Object.entries(a).sort((a, b) => (a[0] > b[0] ? 1 : -1)),
                Object.entries(b).sort((a, b) => (a[0] > b[0] ? 1 : -1))
            );
    }
    return false;
}