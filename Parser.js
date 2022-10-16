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

const specialForms = Object.create(null);

//create a  function to run the syntex tree
/**
 * 
 * @param {*} expr 
 * @param {*} scope 
 * @returns 
 
function evaluate(expr, scope) {
  if (expr.type == "value") {
    return expr.value;
  } else if (expr.type == "word") {
    //check if the binding is define in scope
    if (expr.name in scope) {
      return scope[expr.name];
    } else {
      throw new ReferenceError(`Undefined binging ${expr.name}`);
    }
  } else if (expr.type == "apply") {
    //if the application is special form, we don't EVALUATE anything
    // we rather pass the argment expression along with the scope
    let { operator, args } = expr;
    if ((operator.type = "word" && operator.name in specialForms)) {
      return specialForms[operator.name](expr.args, scope);
    } else {
      //but if it s a normal call, we EVALUATE the operator.Verify if
      //it is a function and call if with evaluated argments
      let op = evaluate(operator, scope);
      if (typeof op === "function") {
        return op(
          ...args.map((arg) => {
            evaluate(arg, scope);
          })
        );
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}
*/

// const specialForms = Object.create(null);

function evaluate(expr, scope) {
  if (expr.type == "value") {
    return expr.value;
  } else if (expr.type == "word") {
    if (expr.name in scope) {
      return scope[expr.name];
    } else {
      throw new ReferenceError(`Undefined binding: ${expr.name}`);
    }
  } else if (expr.type == "apply") {
    let { operator, args } = expr;
    if (operator.type == "word" && operator.name in specialForms) {
      return specialForms[operator.name](expr.args, scope);
    } else {
      let op = evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map((arg) => evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

//add if function to specialForm
//it two params
// the first args must have length of 3
//checks if the first element from args is not false
//if it so then return evaluated 2nd element and scope
// if it false, it returns evaluated third element and scope
specialForms.if = (args, scope) => {
  if (args.length != 3) {
    throw new SyntaxError("Wrong number of arg to if");
  } else if (evaluate(args[0], scope) !== false) {
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};

specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong numbe of args to while");
  }
  while (evaluate(args[0]) !== false) {
    evaluate(args[1], scope);
  }
  return false; // returned false bcz undefine doesn't exist in Egg
};

// do wchich execute all its args
specialForms.do = (args, scope) => {
  let value = false;
  for (let arg in args) {
    value = evaluate(arg, scope);
  }
  return value;
};

//create a form define expecting 2 argument first is word and
//second is expression producing a value that is assigned
// to that word as its seconde arg
specialForms.define = (args, scope) => {
  if (args.length != 2 || arg[0].type != "word") {
    throw new SyntaxError("Incorrect use of define");
  }
  let value = evaluate(args[1], scope);
  args[scope[0].name] = value;
  return value;
};

//to be able to acces the if form we just defined,
// we need boolean so let create it and it is our
//global scope

const topScop = Object.create(null);
topScop.true = true;
topScop.false = false;

// we can now negate our boolean value

let prog = parse(`if(true, false, true)`);
console.log(evaluate(prog, topScop));

//create arthmetic comparison operators to add to the
//function scope.
for (let op of ["<", ">", "==", "+", "-", "/", "*"]) {
  topScop[op] = Function("a, b", `return a ${op} b;`);
  console.log(topScop[op]);
}

//printing out function
topScop.print = (value) => {
  console.log(value);
  return value;
};

//a function to parse a program and run it
function run(program) {
  console.log(Object.create(topScop));
  console.log(parse(program));
  console.log(evaluate(parse(program)));

  return evaluate(parse(program), Object.create(topScop));
}
