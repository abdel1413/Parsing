function ParseExpression(program) {
  //call the helper function which cut off the space from the begining
  //of the string
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
  return parseAply(expr, program.slice(match[0].length));
}

//create a helper function that cut off white space from the start
//of programm string
function skipeSpace(string) {
  let first = string.search(/\S/);
  console.log(first);
  if (first === -1) return "";
  return string.slice(first);
}

//create a function parsApply that  takes
// the matched parts from program string and the object for the
// expression to check if it is an application. If so, it
//parse the parenthesized list of arguments
function parseAply(expr, program) {
  program = skipeSpace(program);
  if (program[0] != "(") {
    return { expr: expr, rest: program };
  }

  program = skipeSpace(program.slice(1));
  expr = { type: "apply", operator: expr, args: [] };
  while (program[0] != ")") {
    let arg = ParseExpression(program);
    expr.args.push(arg.expr);
    program = skipeSpace(arg.rest);
    if (program[0] == ",") {
      program = skipeSpace(program.slice(1));
    } else if (program[0] != ")") {
      throw new TypeError("Expected ,',' of ')'");
    }
  }
  return parseAply(program.slice(1));
}
