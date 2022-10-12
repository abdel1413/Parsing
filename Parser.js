function ParseExpression(program) {
  //call the helper function which cut off the space from the begining
  //of the string
  program = skipeSpace(program);
  //console.log("skip spacd", program);

  //create the binding to match and the expression
  let match, expr;

  // execute the program using RegExp
  if ((match = /^"([^"]*)"/.exec(program))) {
    expr = { type: "value", value: match[1] };
  } else if ((match = /^\d+\b/.exec(program))) {
    expr = { type: "value", value: Number(match[0]) };
  } else if ((match = /^[^\s(),#"]+/.exec(program))) {
    expr = { type: "word", name: match[0] };
  } else {
    throw new SyntaxError(" Unexpected syntax " + program);
  }
  return parseAply(expr, program.slice(match[0].length));
}

//create a helper function that cut off white space from the start
//of programm string
function skipeSpace(string) {
  let first = string.search(/\S/);

  console.log("first " + first); //0
  if (first == -1) return "";
  console.log("string.slice(first) ", string.slice(first));
  //string.slice(first)  +(a, 10)
  //string.slice(first)  (a, 10)
  //string.slice(first)  a, 10)
  //string.slice(first)  , 10)
  //string.slice(first)  10)
  //string.slice(first)  )
  //first -1

  return string.slice(first);
}

//create a function parsApply that  takes
// the matched parts from program string and the object for the
// expression to check if it is an application. If so, it
//parse the parenthesized list of arguments
function parseAply(expr, program) {
  console.log("praserapply expr", expr, "prog ", program);
  // 1 loop: praserapply: expre {type: 'word', name: '+'} name: "+" type: "word" prog  (a, 10)
  //2nd loop: praserapply: expre {type: 'word', name: 'a'} prog  , 10)
  //3rd:praserapply: expre {type: 'value', value: 10} prog  )
  //4th: praserapply: expre {type: 'apply', operator: {…}, args: Array(2)} prog

  program = skipeSpace(program);
  console.log("prog", program); //+(a, 10)
  console.log("prog[0]", program[0]); //+
  if (program[0] != "(") {
    console.log("expr: expr, rest: program ", { expr: expr, rest: program });
    // 1st loop: expr: expr, rest: program  {expr: {…}, rest: ', 10)'}
    // 2 expr: expr, rest: program  {expr: {…}, rest: ')'}
    // 3 expr: expr, rest: program  {expr: {…}, rest: ''}
    return { expr: expr, rest: program }; //
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
      throw new SyntaxError("Expected ',' or ')'");
    }
  }
  return parseAply(expr, program.slice(1));
}

//now create a parse function that verifies that
//it has reached the end of the input string
//after parsing the expression which gives us the
//program's data structure
function parse(program) {
  let { expr, rest } = ParseExpression(program);
  if (skipeSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }
  return expr;
}

console.log(parse("+(a, 10)"));
