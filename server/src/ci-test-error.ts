// Intentional type error for CI Log Lens testing — delete after test
function greet(name: string): string {
  return name * 2; // TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type
}

const result: number = greet("Mac"); // TS2322: Type 'string' is not assignable to type 'number
