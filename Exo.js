topScope.array = (...value) => value;
topScope.length = (array) => array.length;
topScope.element = (array, i) => array[i];

//exo 2
function skipeSpace(string) {
  let first = string.match(/^(\s|#.*)*/);
  if (first == -1) return "";
  return string.slice(first[0].length);
}

console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}

console.log(parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}

//exo3

specialForms.set = (args, env) => {
  if (args[0].length != 2 || args[0].type != "word") {
    throw new TypeError("Bad use of set");
  }
  let varName = args[0].name;
  let value = evaluate(args[1], env);
  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, varName)) {
      scope[varName] = value;
      return value;
    }
  }
  throw new ReferenceError(`Setting an undefined variable ${varName}`);
};

run(`
do(define(x, 4),
   define(setx, fun(val, set(x, val))),
   setx(50),
   print(x))
`);
// → 50
