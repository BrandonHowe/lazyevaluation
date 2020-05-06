type Lazy<T> = () => T;

const lazify = <T>(val: T): Lazy<T> => (() => val);

type LazyArray<T> = Lazy<Lazy<T>[]>;

const lazyToGreedy = <T>(arr: T[]): Lazy<Lazy<T>[]> => {
    return lazify(arr.map(l => lazify(l)));
};

type Comparable = number | boolean;

const lazyQuicksort = <T extends Comparable>(arr: LazyArray<T>, comparator: (a: Lazy<T>, b: Lazy<T>) => Lazy<number>): LazyArray<T> => {
    if (!arr().length) return arr;
    const [x, ...xs] = arr();
    const smallerSorted = lazyQuicksort(lazify(xs.filter((a) => comparator(a, x)() <= 0)), comparator);
    const biggerSorted = lazyQuicksort(lazify(xs.filter((a) => comparator(a, x)() > 0)), comparator);
    return lazify([...smallerSorted(), x, ...biggerSorted()]);
};

const unsortedArr = lazyToGreedy([2, 4, 1, 3]);
const sorted: LazyArray<number> = lazyQuicksort(unsortedArr, (a, b) => () => a() - b());
console.log(sorted().map(l => l()));

const mapLazy = <T, U>(val: Lazy<T>, mapper: (value: T) => U): Lazy<U> => lazify(mapper(val()));
const bindLazy = <T, U>(val: Lazy<T>, binder: (value: T) => Lazy<U>): Lazy<U> => binder(val());

console.log(bindLazy(lazify(5), (l) => lazify(`blah: ${l * 2}`))());

const applyLazy = <T, U>(val: Lazy<T>, func: Lazy<(v: T) => U>): Lazy<U> => lazify(func()(val()));
