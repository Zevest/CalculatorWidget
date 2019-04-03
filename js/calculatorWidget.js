class Calculator extends Widget {

  constructor(id, app) {
    super(id, CalculatorModel, CalculatorView, CalculatorController, app);
  }

  setUp() {
    super.setUp();
    this.sizeX = 1.25;
    this.sizeY = 1.75;
    this.header = true;
  }
}

class CalculatorModel extends WidgetModel {

  constructor() {
    super();
    this.errored = false;
    this.memory = 0;
    this.history = [];
    this.hIndex = 0;
    this.numberMax = 10000;
  }

  setUp() {
    super.setUp();

  }
  // Return msg and set error state to true
  error(msg) {
    this.errored = true;
    return msg;
  }
  // Get order of queryParenthesis
  queryParenthesis(lst) {
    let r = [];
    let index = [];
    let count = [0, 0];
    for (let i = 0; i < lst.length; i++) {
      count[0] = (lst[i] == "(") ? count[0] + 1 : count[0];
      count[1] = (lst[i] == ")") ? count[1] + 1 : count[1];
    }
    if (count[0] != count[1]) return this.error("SyntaxError");

    for (let i = 0; i < lst.length; i++) {
      if (lst[i] == "(") {
        index.push(i);
      }
      if (lst[i] == ")") {
        r.push([index.pop(index.length), i]);
      }
    }
    return r;
  }
  // Return true if it a is a number or use to describe a number
  usedForNumber(a) {
    return a == parseFloat(a) || a === "." || a === "-";
  }
  // Convert String expretion into list splitting number symbol of operation
  parseExpr(expr) {
    let t = [""],
      index = 0, // number
      wasNumber = false, // last charater was a number
      txt = expr.split("");

    function next() { // update index
      index++;
      t[index] = "";
    }

    for (let i = 0; i < txt.length; i++) {
      let char = txt[i];
      if (!wasNumber && i > 0) {
        next();
      }
      if (this.usedForNumber(char)) {
        t[index] += char;
        wasNumber = true;
        if (char === ".");
      } else {
        if (wasNumber) next();
        t[index] += char;
        wasNumber = false;
      }
    }
    //Convert number from Sring to float
    for (let i = 0; i < t.length; i++) {
      if (this.usedForNumber(t[i])) t[i] = parseFloat(t[i]);
    }
    //Remove any unExpected char from the list
    let isSign = x => ["+", "/", "*", "−"].includes(x);
    if (isNaN(t[0]) && t[0] !== "(" && !isSign(t[0])) t.shift();
    for (let i = t.length - 1; i > 0; i--) {
      if (t[i] === "") {
        t.splice(i, 1);
      }
    }
    t.unshift("(");
    t.push(")");
    return t;
  }
  // Calculate short expretion
  calculate(lst) {
    let copy = lst;
    if (lst[1] === ")") {
      return this.error("SyntaxError: Missing Operation");
    }
    // division and multiplication
    let y = copy.slice(1, copy.length - 1)
    if (y.includes("(")) {
      copy[y.indexOf("(") + 1] = "*";
    }

    let i = 0;
    while (copy.includes("*") || copy.includes("/")) {
      let a = copy.indexOf("*");
      let b = copy.indexOf("/");
      if (a > 0) {
        if (isNaN(copy[a - 1]) || isNaN(copy[a + 1])) {
          return this.error("SyntaxError");
        }
      }
      if (b > 0) {
        if (isNaN(copy[b - 1]) || isNaN(copy[b + 1])) {
          return this.error("SyntaxError");
        }
      }
      if (a >= 1 && b >= 1) {
        if (a > b) {
          copy.splice(b - 1, 3, lst[b - 1] / lst[b + 1]);
        } else {
          copy.splice(a - 1, 3, lst[a - 1] * lst[a + 1]);
        }
      } else if (a >= 1) {
        copy.splice(a - 1, 3, lst[a - 1] * lst[a + 1]);
      } else if (b >= 1) {
        copy.splice(b - 1, 3, lst[b - 1] / lst[b + 1]);
      }
      i++;
      if (i > this.numberMax) {
        return this.error("Error: Too much operation");
      }
    }
    i = 0;
    // addtion and substration
    while (copy.includes("+") || copy.includes("−")) {
      let a = copy.indexOf("+");
      let b = copy.indexOf("−");
      if (a > 0) {
        if (isNaN(copy[a - 1]) || isNaN(copy[a + 1])) {
          return this.error("SyntaxError");
        }
      }
      if (b > 0) {
        if (isNaN(copy[b - 1]) || isNaN(copy[b + 1])) {
          return this.error("SyntaxError");
        }
      }
      if (a >= 1 && b >= 1) {
        if (a > b) {
          copy.splice(b - 1, 3, lst[b - 1] - lst[b + 1]);
        } else {
          copy.splice(a - 1, 3, lst[a - 1] + lst[a + 1]);
        }
      } else if (a >= 1) {
        copy.splice(a - 1, 3, lst[a - 1] + lst[a + 1]);
      } else if (b >= 1) {
        copy.splice(b - 1, 3, lst[b - 1] - lst[b + 1]);
      }
      i++;
      if (i > this.numberMax) {
        return this.error("Error: too much operation");
      }
    }
    return copy[1];
  }
  // Apply the calculation function using the correct order of operation
  evaluate(arg, lst) {
    if (typeof lst == "string") {
      arg.display.textContent = lst;
      return;
    }
    let copy = lst,
      i = 1;

    while (i < copy.length) {
      if (copy[i] == "(") {
        if (!(copy[i - 1] == "+" || copy[i - 1] == "-" || copy[i - 1] == "*" || copy[i - 1] == "/")) {
          copy.splice(i, 0, "*");
          i++;
        }
      }
      i++;
    }

    let step = this.queryParenthesis(copy).length;

    for (let i = 0; i < step; i++) {
      let par = this.queryParenthesis(copy);
      if (typeof par == "string") return par;
      let a = par[0][0],
        b = par[0][1];
      copy.splice(a, b - a + 1, this.calculate(copy.slice(a, b + 1)))
    }
    return copy[0];
  }
  // query result
  getResult(arg) {
    if (this.errored) {
      arg.display.textContent = "";
      this.errored = false;
    } else {
      this.history.push(arg.display.textContent)
      let lst = this.parseExpr(arg.display.textContent);
      let a = this.evaluate(arg, lst);
      if (!isNaN(a)) {
        this.history.push(a.toString());
        arg.display.textContent = a;
      } else if (typeof a === "string") arg.display.textContent = a;
      else a = error("SyntaxError");
    }
    this.hIndex = this.history.length - 1;
  }
  // Add value to memory
  memoryAdd(val) {
    let a = this.evaluate(null, this.parseExpr(val));
    if (!isNaN(a)) this.memory += a;
  }
  // Subtract value from memory
  memorySub(val) {
    let a = this.evaluate(null, this.parseExpr(val));
    if (!isNaN(a)) this.memory -= a;
  }
}

class CalculatorView extends WidgetView {

  constructor() {
    super();
    this.buttons = [];
  }

  setUp() {
    super.setUp();
  }

  draw() {
    super.draw();
    this.display = HH.create("div");
    SS.style(this.display, {
      "float": "left",
      "width": "100%",
      "height": "50px",
      "backgroundColor": "#ffffff",
      "border": "1px solide black",
      "fontSize": "16px",
      "lineHeight": "250%",
      "overflow-y": "hidden",
      "overflow-x": "auto"
    });
    this.stage.appendChild(this.display);
    this.createAllButton();
    this.showButton();
  }
  // Create all necessary button
  createAllButton() {
    this.buttonFactory('mc', event => (this.memoryClear(this)), null, [1.25]);
    this.buttonFactory('m+', event => (this.memoryAdd(this)), null, [1.25]);
    this.buttonFactory('m-', event => (this.memorySub(this)), null, [1.25]);
    this.buttonFactory('mr', event => (this.memoryShow(this)), null, [1.25]);
    this.buttonFactory('AC', event => (this.rm(this)));
    this.buttonFactory('C', event => (this.del(this)));
    this.buttonFactory('⬆', event => this.updateIndex(-1));
    this.buttonFactory('⬇', event => this.updateIndex(1));
    this.buttonFactory("+", this.add, [this, "+"]);
    this.buttonFactory(7, this.add, [this, "7"]);
    this.buttonFactory(8, this.add, [this, "8"]);
    this.buttonFactory(9, this.add, [this, "9"]);
    this.buttonFactory("(", this.add, [this, "("]);
    this.buttonFactory("−", this.add, [this, "−"]);
    this.buttonFactory(4, this.add, [this, "4"]);
    this.buttonFactory(5, this.add, [this, "5"]);
    this.buttonFactory(6, this.add, [this, "6"]);
    this.buttonFactory(")", this.add, [this, ")"]);
    this.buttonFactory("÷", this.add, [this, "/"]);
    this.buttonFactory(1, this.add, [this, "1"]);
    this.buttonFactory(2, this.add, [this, "2"]);
    this.buttonFactory(3, this.add, [this, "3"]);
    this.buttonFactory('(-)', this.add, [this, "-"]);
    this.buttonFactory("×", this.add, [this, "*"]);
    this.buttonFactory(0, this.add, [this, "0"], [2, 1]);
    this.buttonFactory(",", this.add, [this, "."]);
    this.buttonFactory('=', event => (this.calc(this)), null, [2, 1]);
  }
  // Add all button from list to stage
  showButton() {
    for (let i = 0; i < this.buttons.length; i++) {
      this.stage.appendChild(this.buttons[i]);
    }
  }
  // Add button to list
  buttonFactory(name, func, val, dim = [1, 1]) {
    let b = HH.create("div");
    b.textContent = name;
    b.addEventListener("click", event => func(event, val));
    SS.style(b, {
      "fontSize": "20px",
      "textDecoration": "none",
      "width": "" + 20 * dim[0] + "%",
      "height": "" + 12.5 * dim[1] + "%",
      "float": "left",
      "textAlign": "center",
      "cursor": "pointer",
      "scrollbar-height": null
    });
    this.buttons.push(b);
  }
  // Request error state from controller
  errored() {
    return this.mvc.controller.errored();
  }
  // Request Error state before adding character
  add(event, arg) {
    if (arg[0].errored()) {
      arg[0].mvc.controller.setError(false);
    } else arg[0].display.textContent += arg[1];
    arg[0].mvc.controller.setIndex();
    arg[0].display.scrollTo(arg[0].display.textContent.length * 20, 0);
  }
  // Delete last character
  del(arg) {
    if (arg.errored()) arg.display.textContent = "";
    let res = "";
    for (let i = 0; i < arg.display.textContent.length - 1; res += arg.display.textContent[i], i++); {}
    arg.display.textContent = res;
    this.mvc.controller.setIndex();
  }
  // Delete all character
  rm(arg) {
    arg.display.textContent = "";
    this.mvc.controller.setIndex();
  }
  // Request result from controller
  calc(arg) {
    this.mvc.controller.getResult(arg);
  }
  // Request history index update from controller
  updateIndex(w) {
    this.mvc.controller.updateHIndex(w)
  }
  // Request a memory clear from controller
  memoryClear(arg) {
    arg.mvc.controller.memoryClear(arg);
  }
  // Request a memory addition from controller
  memoryAdd(arg) {
    arg.mvc.controller.memoryAdd(arg);
  }
  // Request a memory subtraction from controller
  memorySub(arg) {
    arg.mvc.controller.memorySub(arg);
  }
  // Request a memory stored value
  memoryShow(arg) {
    arg.mvc.controller.memoryShow(arg);
  }
}

class CalculatorController extends WidgetController {

  constructor() {
    super();
  }

  setUp() {
    super.setUp();
  }
  // Update view
  setField(val) {
    this.mvc.view.display.textContent = val;
  }
  // Request result from model
  getResult(arg) {
    return this.mvc.model.getResult(arg);
  }
  // Change history index, set by default to the last index
  setIndex(w = this.mvc.model.history.length) {
    this.mvc.model.hIndex = w;
  }
  // Update history index
  updateHIndex(w) {
    this.mvc.model.hIndex += w;
    this.setIndex((this.mvc.model.hIndex > this.mvc.model.history.length) ? this.mvc.model.history.length : this.mvc.model.hIndex);
    this.mvc.model.hIndex = (this.mvc.model.hIndex < 0) ? 0 : this.mvc.model.hIndex;
    this.setField(this.mvc.model.history[this.mvc.model.hIndex]);
  }
  // Return model's error state
  errored() {
    return this.mvc.model.errored;
  }
  // Set model's error state
  setError(state) {
    this.mvc.model.errored = state;
  }
  // Clear model's memory by resetting it to 0
  memoryClear() {
    this.mvc.model.memory = 0;
  }
  // Request a memory addition from model
  memoryAdd(arg) {
    this.mvc.model.memoryAdd(arg.display.textContent);
  }
  // Request a memory subtraction from model
  memorySub(arg) {
    this.mvc.model.memorySub(arg.display.textContent);
  }
  // Show memory stored value on display
  memoryShow() {
    this.setField(this.mvc.model.memory);
  }
}