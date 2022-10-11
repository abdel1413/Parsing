function ParseExpression(program) {
  //call the helper function which checks the space from the begining
  //to skip

  program = skipeSpace(program);
  console.log(program);

  //create the binding to match and the expression
  let match, expr;

  // execute the program using RegExp
  if ((match = /^"([^"]*)"/.exec(program))) {
    expr = { type: "value", value: match[1] };
    console.log(expr.type);
    console.log(expr.value);
  } else if ((match = /^\d+\b/.exec(program))) {
    expr = { type: "value", value: Number(match[1]) };
  } else if ((match = /^[^\s(),#"]+/.exec(program))) {
    expr = { type: "word", name: match[0] };
  } else {
    throw new TypeError(" Unexpected syntax " + program);
  }
}

//create a helper function
function skipeSpace(string) {
  let first = string.search(/\S/);
  console.log(first);
  if (first === -1) return "";
  return string.slice(first);
}
