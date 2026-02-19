// Intentional lint errors for CI Log Lens testing — delete after test

// error  Unexpected any  @typescript-eslint/no-explicit-any
function getCharacter(id: any): any {
  return id;
}

// error  Unexpected any  @typescript-eslint/no-explicit-any
function processData(data: any): void {
  console.log(data);
}

getCharacter(1);
processData("Mac");
