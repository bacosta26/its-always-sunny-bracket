// Intentional lint errors for CI Log Lens testing — delete after test

// no-unused-vars: 'dee' is declared but never used
const dee = "Dee Reynolds";

// @typescript-eslint/no-explicit-any: 'any' type is not allowed
function getCharacter(id: any): any {
  return id;
}

// eqeqeq: use '===' instead of '=='
if (getCharacter(1) == "Mac") {
  console.log("It's Mac");
}
