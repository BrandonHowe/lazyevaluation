# Lazy evaluation in TypeScript

One rare feature that's only around in some functional programming languages (think Haskell) is lazy evaluation. It's supported in many languages, but most languages end up having it be slower than "greedy" or just regular loading. Today we'll look at implementing laziness in TypeScript.

## What is laziness?

What we'll be using as laziness is essentially a value that is only defined when a function is called. It's lazy where the variable doesn't exist when it doesn't need to. We'll also be using the term "greedy" for a non-lazy variable (you might have heard this as eager or strict as well).

So let's define a type for our lazy variable. We can define it as a function that returns a variable. The variable can be anything, so we can use a generic.

```typescript
type Lazy<T> = () => T;
```

## Helper functions

Great! We've now got our Lazy type. That will be very important over the rest of this article.

We should also define a function `lazify` that turns a variable into a lazy version of that variable. Because it can accept any variable, we will use a generic variable.

```typescript
const lazify = <T>(val: T): Lazy<T> => (() => val);
```

But how do we access our lazy variables? It's simple. Because lazy variables are just functions, we can just call them.

```typescript
const lazyNumber = lazify(5);
console.log(lazyNumber); // logs a function
console.log(lazyNumber()); // logs 5;
```

See? It's not that complex. All we're doing is transitioning from variables to functions.

## Lazy arrays

Let's try something a little more advanced. Let's create a lazy array of lazy variables.

```typescript
const lazyArr = lazify([lazify(3), lazify(8), lazify(4)]);
```

Collapsing a lazy array is simple too. We can just use a .map() to iterate through the array and collapse each individual element.

```typescript
const greedyArr = lazyArr().map(l => l());
console.log(greedyArr); // logs [3, 8, 4]
```

See? It's pretty simple. Make sure to note that we call lazyArr, we don't just map it directly - the array itself is lazy too. Let's also add a function that turns a greedy array into a lazy one:

```typescript
const lazyToGreedy = <T>(arr: T[]): Lazy<Lazy<T>[]> => {
    return lazify(arr.map(l => lazify(l)));
};
```

Great! Now we can turn greedy arrays in to lazy arrays and back again. Before we finish this section, let's define our `LazyArray` type. It's a lazy array of lazy values. Each value can be any type, so we will use a generic.

```typescript
type LazyArray<T> = Lazy<Lazy<T>[]>;
```

This `LazyArray` type will come in handy in the next section.

## Example - Quicksort

Let's implement a quicksort with a lazy array. We'll start by defining our quicksort function. It will take in a lazy array and a comparator function, and it will return another lazy array. The array parameter is going to be of type `LazyArray`, while the compare function will take 2 lazy arguments and then return a number.

```typescript
const lazyQuicksort = <T>(arr: LazyArray<T>, comparator: (a: Lazy<T>, b: Lazy<T>) => Lazy<number>): LazyArray<T> => {
    // We'll fill this in later...
}
```

Great! We have our function types implemented. Now let's move on and start defining the body of our function.

Because this isn't a quicksort tutorial, I won't be talking about how to write that here. If you want to learn about how quicksort works, then I would recommend reading a different article about it. However, I will talk about the things that make this function different from a regular implementation.

```typescript
type Comparable = number | boolean;
const lazyQuicksort = <T extends Comparable>(arr: LazyArray<T>, comparator: (a: Lazy<T>, b: Lazy<T>) => Lazy<number>): LazyArray<T> => {
    if (!arr().length) return arr;
    const [x, ...xs] = arr();
    const smallerSorted = lazyQuicksort(lazify(xs.filter((a) => comparator(a, x)() <= 0)), comparator);
    const biggerSorted = lazyQuicksort(lazify(xs.filter((a) => comparator(a, x)() > 0)), comparator);
    return lazify([...smallerSorted(), x, ...biggerSorted()]);
};
```

Look at the `lazify` calls. Because this is a lazy version of quicksort, with a lazy comparator, it's important to remember that all arguments going into the comparator must be lazy. We also return a lazy array, so we `lazify` the final array. We also make sure that T is of type number or boolean because when you subtract them, it does not return NaN.

Now let's test this thing out! First we will define an unsorted, lazy array:

```typescript
const unsortedArr = lazyToGreedy([2, 4, 1, 3]);
```

Then we will sort it with our `lazyQuicksort` function:

```typescript
const sorted = lazyQuicksort(unsortedArr, (a, b) => () => a() - b());
```

And finally, we will collapse it:

```typescript
console.log(sorted().map(l => l()));
```

This should log our desired result, `[1, 2, 3, 4]`.

## Should I use this?

The answer is no. It sounds cool, but the way that JavaScript handles functions is not that great and it's about twice as fast to just use greedy variables. If you're using a language like Haskell where lazy evaluation is a core part of the language, that's great, but it just does not fit in JavaScript. Still, though, it's a fun idea, and I loved exploring it and checking it out.
