---
trigger: always_on
---

# Guidelines for Coding

## Basic policies

- **✅Immutability** rather than **❌mutability**
- **✅Non-destructive** rather than **❌destructive**
- **✅Declarative**, not **❌procedural**
- **✅Descriptive** rather than **❌short naming**

## Recommendations

- **Early Return:**  
  Avoid nested conditional branches and clarify the flow of processing by returning immediately from the function when conditions are not met.  
  Avoiding unnecessary nesting improves code readability and maintainability.

```typescript
// ❌ Using nested conditional branches makes the flow of processing unclear.
const checkValue = (x: number | null): string => {
  if (x !== null) {
    if (x > 0) {
      if (x < 10) {
        return 'Small positive';
      } else if (x < 20) {
        return 'Big positive';
      }
    }
  }
  return 'Other';
};
// ✅ Using early return allows you to immediately return from the function when conditions are not met.
const checkValue2 = (x: number | null): string => {
  // Immediately return in abnormal cases (commonly referred to as "guard clauses").
  if (x === null) return 'Other';
  if (x <= 0) return 'Other';
  // Normal cases
  if (x < 10) return 'Small positive';
  if (x < 20) return 'Big positive';
  return 'Other';
};
```

- **Function Extraction:**  
  Extract complex conditions or logic into separate single-responsibility functions to achieve simple callbacks or branching.

```typescript
type User = {
  age: number;
  active: boolean;
  role: admin | member;
};

// ❌ Complex conditions in if statements reduce readability.
if (user.age >= 18 && user.active && user.role === 'admin' /* && ... */) {
  console.log('Valid admin user');
}

// ✅ Extracting complex condition checks into functions improves readability.
const isValidAdminUser = (user: User): boolean => {
  // Grouping meaningful checks into variables improves readability.
  const isAdult = user.age >= 18;
  const isActive = user.active;
  const isAdmin = user.role === 'admin';
  /* ... */
  return isAdult && isActive && isAdmin /* && ... */;
};

if (isValidAdminUser(user)) {
  console.log('Valid admin user');
}
```

- **Divide into Small, Single-Responsibility Units:**  
  Functions and classes should focus on a single responsibility, be short, clear, and reusable.

- **Descriptive Naming for Variables and Functions:**  
  Names for variables, functions, and classes should clearly indicate their roles and intentions. Choose descriptive names over brevity to serve as a substitute for comments.

- **Write Comments Only When Necessary and Explain the Intent (Why):**  
  Write comments to explain the intent or background of the code. Ideally, the code should be self-explanatory to the extent that comments are unnecessary.  
  If necessary, explain why certain decisions were made or why certain actions were taken. Use TODO annotations to highlight areas that need to be addressed later.

## Prohibited/Discouraged Practices

### Prohibit Nested `if` with `else if`

As shown in the **Early Return** example in the recommendations, nested `if` statements with `else if` are prohibited as they reduce code readability.

### Prohibit `switch` Statements

```typescript
// ❌ Switch statements can obscure conditions and risk missing return or break statements.
function getStatus(code: number): string {
  switch (code) {
    case 200:
      return 'OK';
    case 404:
      return 'Not Found';
    default:
      return 'Unknown';
  }
}

// ✅ Using a dictionary (object lookup) simplifies all conditions.
function getStatus(code: number): string {
  const statusMap: { [key: number]: string } = {
    200: 'OK',
    404: 'Not Found',
  };
  return statusMap[code] || 'Unknown';
}
```

---

### Prohibit Using Ternary Operators as Control Structures (if Alternative)

Ternary operators are originally expressions for selecting a single value.  
Using them as control structures like `if` makes it less intuitive to understand which condition executes which process.

```typescript
// ✅ Using a ternary operator to select a single value is acceptable.
const className = isPaymentMode ? "payment" : "default";

// ❌ Using a ternary operator for multiple side-effect operations makes the flow of processing unintuitive.
isPaymentMode
  ? (
      console.log("payment mode");
      toasts.push("payment mode enabled");
      return <PaymentComponent />;
    )
  : (
      console.log("default mode");
      toasts.push("default mode enabled");
      return <DefaultComponent />;
    );

// ✅ Use if/else statements for control structures to make the flow of processing clear.
if (isPaymentMode) {
  console.log("payment mode");
  toasts.push("payment mode enabled");
  return <PaymentComponent />;
}

console.log("default mode");
toasts.push("default mode enabled");
return <DefaultComponent />;
```

---

### Discourage Sequential Processing (for, while, do-while, for-in, for-of, Array#forEach)

```typescript
// ❌ Using explicit for loops or forEach exposes the details of sequential processing in the code, making declarative descriptions impossible. Using let for loop variables is also problematic.
function getSquares(numbers: number[]): number[] {
  const squares: number[] = [];
  for (let i = 0; i < numbers.length; i++) {
    squares.push(numbers[i] * numbers[i]);
  }
  return squares;
}

// ✅ Using the map higher-order function allows you to declaratively describe array transformations, hiding the details of sequential processing. Using const ensures immutability.
function getSquares(numbers: number[]): number[] {
  return numbers.map((num) => num * num);
}
```

---

### Discourage Using `if` Statements Inside Functions Passed to Higher-Order Functions

As shown in the **Function Extraction** example in the recommendations, using `if` statements inside functions passed to higher-order functions complicates the responsibility of the function and reduces readability.

---

### Prohibit Nested Ternary Operators

```typescript
// ❌ Nested ternary operators make conditions difficult to read and the intent of the code unclear.
const resultNG = condition1 ? (condition2 ? 'A' : 'B') : 'C';

// ✅ Extract complex condition processing into a computeResult function and use if statements with guard clauses to improve readability.
const computeResult = (): string => {
  if (condition1 && condition2) return 'A';
  if (condition1 && !condition2) return 'B';
  return 'C';
};

const resultOK = computeResult();
```

---

### Prohibit Using Short-Circuit Evaluation as Conditional Branching

```typescript
// ❌ Using short-circuit evaluation (&&) as a substitute for conditional branching makes it unclear under which conditions side effects are executed.
const conditionNG = true;
conditionNG && console.log('Condition is true');

// ✅ Use explicit if statements to make conditional branching and its side effects clear.
const conditionOK = true;
if (conditionOK) {
  console.log('Condition is true');
}
```

---

### Discourage `let`/`var`

```typescript
// ❌ Using let/var for mutable state management violates the principle of immutability and increases the risk of unexpected side effects.
function multiplyAndAdd(val: number): number {
  var result = val * 2; // Using let or var is discouraged
  result = result + 1;
  return result;
}

// ✅ Use const and expressions to avoid variable reassignment and mutable state, ensuring immutability.
const multiplyAndAdd = (val: number): number => val * 2 + 1;
```

---

### Discourage Destructive Array Operations

Destructive methods that directly modify arrays are discouraged as they change the state of the original array.

- [Survival TypeScript - Non-Destructive Array Operations](https://typescriptbook.jp/reference/values-types-variables/array/array-operations)
- [Non-Destructive Array Modifications in JavaScript](https://qiita.com/honey32/items/d7ec396b0f62ff65c7e6)

#### Array Concatenation and Appending to the End

```typescript
// ❌ Destructive method
// Using push() adds elements to the original array.
const nums = [1, 2];
nums.push(3); // Destructive
nums.push(4); // Destructive
console.log(nums); // [1, 2, 3, 4]

// ✅ Non-destructive method
// Use concat() or spread syntax to create a new array.
const nums1 = [1, 2];
const nums2 = [3, 4];

const all1 = nums1.concat(nums2); // Non-destructive
// Or
const all2 = [...nums1, ...nums2];

console.log(nums1); // [1, 2]
console.log(all1); // [1, 2, 3, 4]
console.log(all2); // [1, 2, 3, 4]
```

#### Removing the Last Element

```typescript
// ❌ Destructive method
// pop() removes the last element from the original array.
const arr = ['a', 'b', 'c'];
arr.pop(); // Destructive
console.log(arr); // ['a', 'b']

// ✅ Non-destructive method
// Use slice() to create a new array excluding the last element.
const arr = ['a', 'b', 'c'];
const newArr = arr.slice(0, -1); // Non-destructive
console.log(arr); // ['a', 'b', 'c']
console.log(newArr); // ['a', 'b']
```

#### Removing the First Element

```typescript
// ❌ Destructive method
// shift() removes the first element from the original array.
const arr = ['a', 'b', 'c'];
arr.shift(); // Destructive
console.log(arr); // ['b', 'c']

// ✅ Non-destructive method
// Use slice(1) or destructuring to create a new array.
const arr = ['a', 'b', 'c'];
const newArr = arr.slice(1); // Non-destructive
// Or
const [, ...newArr2] = arr; // Skip the first element using destructuring

console.log(arr); // ['a', 'b', 'c']
console.log(newArr); // ['b', 'c']
console.log(newArr2); // ['b', 'c']
```

#### Adding to the Beginning

```typescript
// ❌ Destructive method
// unshift() adds elements to the beginning of the original array.
const arr = ['a', 'b'];
arr.unshift('x', 'y'); // Destructive
console.log(arr); // ['x', 'y', 'a', 'b']

// ✅ Non-destructive method
// Use toSpliced() or spread syntax.
const arr = ['a', 'b'];
const newArr = arr.toSpliced(0, 0, 'x', 'y'); // Non-destructive
// Or
const newArr2 = ['x', 'y', ...arr];

console.log(arr); // ['a', 'b']
console.log(newArr); // ['x', 'y', 'a', 'b']
console.log(newArr2); // ['x', 'y', 'a', 'b']
```

#### Sorting and Reversing

```typescript
// ❌ Destructive method
// sort() and reverse() modify the original array.
const arr = [3, 1, 2];
arr.sort((a, b) => a - b); // Destructive
console.log(arr); // [1, 2, 3]

const arr2 = ['a', 'b', 'c'];
arr2.reverse(); // Destructive
console.log(arr2); // ['c', 'b', 'a']

// ✅ Non-destructive method
// Use toSorted() or toReversed(), or copy the array with spread syntax before operating.
const arr = [3, 1, 2];
const sortedArr = arr.toSorted((a, b) => a - b); // Non-destructive
// Or
const sortedArr2 = [...arr].sort((a, b) => a - b);

const arr2 = ['a', 'b', 'c'];
const reversedArr = arr2.toReversed(); // Non-destructive
// Or
const reversedArr2 = [...arr2].reverse();

console.log(arr); // [3, 1, 2]
console.log(sortedArr); // [1, 2, 3]
console.log(sortedArr2); // [1, 2, 3]
console.log(arr2); // ['a', 'b', 'c']
console.log(reversedArr); // ['c', 'b', 'a']
console.log(reversedArr2); // ['c', 'b', 'a']
```

#### Updating Array Elements

```typescript
// ❌ Destructive method
// Directly assigning values to indices modifies the original array.
const arr = ['a', 'b', 'c'];
arr[1] = 'x'; // Destructive
console.log(arr); // ['a', 'x', 'c']

// ✅ Non-destructive method
// Use the with() method to return a new array with the specified position updated.
const arr = ['a', 'b', 'c'];
const newArr = arr.with(1, 'x'); // Non-destructive
console.log(arr); // ['a', 'b', 'c']
console.log(newArr); // ['a', 'x', 'c']
```

---

### Prohibit Using Recursion as a Loop Alternative
// ❌ Using recursion as a loop alternative risks stack overflow and makes the flow of processing unclear.
// ✅ Use the reduce higher-order function to declaratively calculate the sum of an array, enabling safe and clear processing without loops or recursion.