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

  /**
   * @methos error: Return msg and set error state to true
   *
   * @param {string} msg error message
   * 
   * @return {string} error message
   */
  error(msg) {
    this.errored = true;
    console.error(msg);
    return msg;
  }

  /**
   * @method queryParenthesis: Get order of Parenthesis
   *
   * @param {Array} lst Description
   *
   * @return {Array} pairs of parenthesis index
   */
  queryParenthesis(lst) {
    let r = [];
    let index = [];
    let count = [0, 0];
    for (let i = 0; i < lst.length; i++) {
      count[0] = (lst[i] == "(") ? count[0] + 1 : count[0];
      count[1] = (lst[i] == ")") ? count[1] + 1 : count[1];
    }
    if (count[0] != count[1]) return this.error("SyntaxError : QP");
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
  /**
   * @method usedForNumber: Return true if it is a number or use to describe a number
   *
   * @param {string|Number} a Description
   *
   * @return {boolean}
   */
  usedForNumber(a) {
    return a == parseFloat(a) || a === "." || a === "-";
  }

  /**
   * @method parseExpr: Convert String expretion into list splitting number symbol of operation
   *
   * @param {string} expr: Mathematical expression
   *
   * @return {Array}
   */
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
    //Remove any unExpected character from the list
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

  /**
   * @method calculate: Calculate short expression stored and parsed in array
   *
   * @param {Array} lst: parsed mathematical expression
   *
   * @return {string|Array} result or error message
   */
  calculate(lst) {
    let flottant = 10
    console.log(lst);
    let copy = lst;
    if (lst[1] === ")") {
      return this.error("SyntaxError : CLCP");
    }

    let i = 0;
    // Multiplication and division
    while (copy.includes("*") || copy.includes("/")) {
      let a = copy.indexOf("*");
      let b = copy.indexOf("/");
      if (a > 0) {
        if (isNaN(copy[a - 1]) || isNaN(copy[a + 1])) {
          return this.error("SyntaxError : CLCM");
        }
      }
      if (b > 0) {
        if (isNaN(copy[b - 1]) || isNaN(copy[b + 1])) {
          return this.error("SyntaxError : CLCD");
        }
      }
      if (a >= 1 && b >= 1) {
        if (a > b) {
          copy.splice(b - 1, 3, this.fix(flottant, lst[b - 1] / lst[b + 1]));
        } else {
          copy.splice(a - 1, 3, this.fix(flottant, lst[a - 1] * lst[a + 1]));
        }
      } else if (a >= 1) {
        copy.splice(a - 1, 3, this.fix(flottant, lst[a - 1] * lst[a + 1]));
      } else if (b >= 1) {
        copy.splice(b - 1, 3, this.fix(flottant, lst[b - 1] / lst[b + 1]));
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
          return this.error("SyntaxError : CLCA");
        }
      }
      if (b > 0) {
        if (isNaN(copy[b - 1]) || isNaN(copy[b + 1])) {
          return this.error("SyntaxError CLCS");
        }
      }
      if (a >= 1 && b >= 1) {
        if (a > b) {
          copy.splice(b - 1, 3, this.fix(flottant, lst[b - 1] - lst[b + 1]));
        } else {
          copy.splice(a - 1, 3, this.fix(flottant, lst[a - 1] + lst[a + 1]));
        }
      } else if (a >= 1) {
        copy.splice(a - 1, 3, this.fix(flottant, lst[a - 1] + lst[a + 1]));
      } else if (b >= 1) {
        copy.splice(b - 1, 3, this.fix(flottant, lst[b - 1] - lst[b + 1]));
      }
      i++;
      if (i > this.numberMax) {
        return this.error("Error: too much operation");
      }
    }
    return copy[1];
  }

  /**
   * @method evaluate: Apply the calculation function using the correct order of operation
   *
   * @param {Element} arg: HTML input
   * @param {Array|string} lst: parsed mathematical expression or error message
   *
   * @return {Array} result
   */
  evaluate(arg, lst) {
    if (typeof lst == "string") {
      arg.display.textContent = lst;
      return;
    }
    let copy = lst,
      i = 1;

    while (i < copy.length) {
      if (copy[i] == "(") {
        if (!(copy[i - 1] == "+" || copy[i - 1] == "-" || copy[i - 1] == "*" || copy[i - 1] == "/" || copy[i - 1] == "(")) {
          copy.splice(i, 0, "*");
          i++;
        }
      }
      if (copy[i] == ")") {
        if (!(copy[i + 1] == "+" || copy[i + 1] == "-" || copy[i + 1] == "*" || copy[i + 1] == "/" || copy[i + 1] == ")")) {
          copy.splice(i + 1, 0, "*");
          i++;
        }
      }
      if (copy[i] == "%" && i > 1) {
        if (!(copy[i + 1] == "+" || copy[i + 1] == "-" || copy[i + 1] == "*" || copy[i + 1] == "/" || copy[i + 1] == ")")) {
          copy.splice(i, 1, "/");
          copy.splice(i + 1, 0, 100);
          copy.splice(i + 2, 0, "*");
          i += 3;
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
      copy.splice(a, b - a + 1, this.calculate(copy.slice(a, b + 1)));
    }
    return copy[0];
  }

  /**
   * @method fix: truncation to the nth digit after the decimal point
   *
   * @param {Number} n: number of digit after decimal point
   * @param {Number} val: Value to truncate
   *
   * @return {Number} result
   */
  fix(n, val) {
    let t = Math.pow(10, n);
    let res = val * t;
    res = Math.round(res);
    return res / t;

  }

  /**
   * @method getResult: query result
   *
   * @param {Element} arg: HTML input
   */
  getResult(arg) {
    if (this.errored) {
      arg.display.textContent = "";
      this.errored = false;
    } else {
      this.history.push(arg.display.textContent);
      let lst = this.parseExpr(arg.display.textContent);
      let a = this.evaluate(arg, lst);
      if (!isNaN(a)) {
        this.history.push(a.toString());
        arg.display.textContent = a;
      } else if (typeof a === "string") arg.display.textContent = a;
      else a = this.error("SyntaxError : GR");
    }
    this.hIndex = this.history.length - 1;
  }

  /**
   * @method memoryAdd: Add value to memory
   *
   * @param {array} val: parsed mathematical expression
   */
  memoryAdd(val) {
    let a = this.evaluate(null, this.parseExpr(val));
    if (!isNaN(a)) this.memory += a;
  }

  /**
   * @method memoryAdd: Subtract value from memory
   *
   * @param {array} val: parsed mathematical expression
   */
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

  /**
   * @method createAllButton: Create all necessary button
   */
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
    this.buttonFactory("(", this.add, [this, "("], [0.5]);
    this.buttonFactory(")", this.add, [this, ")"], [0.5]);
    this.buttonFactory("−", this.add, [this, "−"]);
    this.buttonFactory(4, this.add, [this, "4"]);
    this.buttonFactory(5, this.add, [this, "5"]);
    this.buttonFactory(6, this.add, [this, "6"]);
    this.buttonFactory("%", this.add, [this, "%"]);
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


  /**
   * @method showButton: Add all button from list to stage
   */
  showButton() {
    for (let i = 0; i < this.buttons.length; i++) {
      this.stage.appendChild(this.buttons[i]);
    }
  }

  //

  /**
   * @method buttonFactory: Add button to list
   *
   * @param {string} name: text displayed on the button
   * @param {function} func: function onClick event
   * @param {string|Number} val: argument to the function
   * @param {array} dim: Dimension of the buttons
   */
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

  /**
   * @method errored: Request error state from controller
   *
   * @return {string} error message
   */
  errored() {
    return this.mvc.controller.errored();
  }

  /**
   * @method add: Request Error state before adding character to text input
   *
   * @param {event} event
   * @param {Array} arg:  [this, value], value: string
   */
  add(event, arg) {
    if (arg[0].errored()) {
      arg[0].mvc.controller.setError(false);
      arg[0].display.textContent = "";
    }
    arg[0].display.textContent += arg[1];
    arg[0].mvc.controller.setIndex();
    arg[0].display.scrollTo(arg[0].display.textContent.length * 20, 0);
  }

  /**
   * @method del: Delete last character of text input
   *
   * @param {Object} arg: this WidgetView
   */
  del(arg) {
    if (arg.errored()) arg.display.textContent = "";
    let res = "";
    for (let i = 0; i < arg.display.textContent.length - 1; res += arg.display.textContent[i], i++); {}
    arg.display.textContent = res;
    this.mvc.controller.setIndex();
  }

  /**
   * @method rm: Delete all character for text input
   *
   * @param {Object} arg: this WidgetView
   */
  rm(arg) {
    arg.display.textContent = "";
    this.mvc.controller.setIndex();
  }

  /**
   * @methods calc: Request result from controller
   *
   * @param {Object} arg: this WidgetView
   */
  calc(arg) {
    this.mvc.controller.getResult(arg);
  }

  /**
   * @method updateIndex: Request history index update from controller
   *
   * @param {Number} w: index increment value
   */
  updateIndex(w) {
    this.mvc.controller.updateHIndex(w)
  }

  /**
   * @method memoryClear - Request a memory clear from controller
   *
   * @param {Object} arg: this WidgetView
   */
  memoryClear(arg) {
    arg.mvc.controller.memoryClear(arg);
  }

  /**
   * @method memoryAdd: Request a memory addition from controller
   *
   * @param {Object} arg: this WidgetView
   */
  memoryAdd(arg) {
    arg.mvc.controller.memoryAdd(arg);
  }

  /**
   * @method memorySub - Request a memory subtraction from controller
   *
   * @param {Object} arg: this WidgetView
   */
  memorySub(arg) {
    arg.mvc.controller.memorySub(arg);
  }


  /**
   * @method memoryShow: Request a memory stored value
   *
   * @param {Object} arg: this WidgetView
   */
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

  /**
   * @method setField: Change the text input textContent
   *
   * @param {String} val new Value
   */
  setField(val) {
    this.mvc.view.display.textContent = val;
  }

  /**
   * @method getResult: Request result from model
   *
   * @param {Object} arg: this WidgetController
   *
   * @return {String|Array} Error message or result
   */
  getResult(arg) {
    return this.mvc.model.getResult(arg);
  }


  /**
   * @method setIndex: Change history index, set by default to the last index
   *
   * @param {Number} w: next Value of model index
   */
  setIndex(w = this.mvc.model.history.length) {
    this.mvc.model.hIndex = w;
  }

  /**
   * @method updateHIndex: Update history index
   *
   * @param {number} w index increment value
   */
  updateHIndex(w) {
    this.mvc.model.hIndex += w;
    this.setIndex((this.mvc.model.hIndex > this.mvc.model.history.length) ? this.mvc.model.history.length : this.mvc.model.hIndex);
    this.mvc.model.hIndex = (this.mvc.model.hIndex < 0) ? 0 : this.mvc.model.hIndex;
    this.setField(this.mvc.model.history[this.mvc.model.hIndex]);
  }

  /**
   * @method errored: Get model's error state
   *
   * @return {boolean} Sate of model's errored
   */
  errored() {
    return this.mvc.model.errored;
  }

  /**
   * @method setError: Set model's error state
   *
   * @param {boolean} state: Next state of model's errored
   */
  setError(state) {
    this.mvc.model.errored = state;
  }

  /**
   * @method memoryClear: Clear model's memory by resetting it to 0
   */
  memoryClear() {
    this.mvc.model.memory = 0;
  }


  /**
   * @method memoryAdd: Request a memory addition from model
   *
   * @param {Object} arg: this WidgetController
   */
  memoryAdd(arg) {
    this.mvc.model.memoryAdd(arg.display.textContent);
  }

  /**
   * @method memorySub: Request a memory subtraction from model
   *
   * @param {Object} arg: this WidgetController
   */
  memorySub(arg) {
    this.mvc.model.memorySub(arg.display.textContent);
  }

  /**
   * @method memoryShow: Show memory stored value on display
   */
  memoryShow() {
    this.setField(this.mvc.model.memory);
  }
}