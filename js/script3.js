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

  error(msg) {
    this.errored = true;
    return msg;
  }

  queryParenthesis(lst) {
    let r = [];
    let index = [];
    let count = [0, 0];
    for (let i = 0; i < lst.length; i++) {
      count[0] = (lst[i] == "(") ? count[0] + 1 : count[0];
      count[1] = (lst[i] == ")") ? count[1] + 1 : count[1];
    }
    if (count[0] != count[1]) return this.error("SyntaxError : Missing parenthese");

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

  usedForNumber(a) {
    return a == parseFloat(a) || a === "." || a === "-";
  }

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

  calculate(lst) {
    let copy = lst;
    if (copy.length == 4) {
      //return error("SyntaxError");
    }
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

  evaluate(arg, lst) {
    if (typeof lst == "string") {
      arg.h.textContent = lst;
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

  getResult(arg) {
    if (this.errored) {
      arg.h.textContent = "";
      this.errored = false;
    } else {
      this.history.push(arg.h.textContent)
      let lst = this.parseExpr(arg.h.textContent);
      let a = this.evaluate(arg, lst);
      if (!isNaN(a)) {
        this.history.push(a.toString());
        arg.h.textContent = a;
      } else if (typeof a === "string") arg.h.textContent = a;
      else a = error("SyntaxError");
    }
    this.hIndex = this.history.length - 1;
  }

  memoryAdd(val) {
    let a = this.evaluate(null, this.parseExpr(val));
    if (!isNaN(a)) this.memory += a;
  }

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
    this.h = HH.create("div");
    SS.style(this.h, {
      "float": "left",
      "width": "100%",
      "height": "50px",
      "backgroundColor": "white",
      "fontSize": "16px",
      "lineHeight": "250%",
      "overflow-y": "hidden",
      "overflow-x": "auto"
    });;
    this.stage.appendChild(this.h);
    this.addButton('mc', event => (this.memoryClear(this)));
    this.addButton('m+', event => (this.memoryAdd(this)));
    this.addButton('m-', event => (this.memorySub(this)));
    this.addButton('mr', event => (this.memoryShow(this)));
    this.addButton('⬆', event => this.updateIndex(-1));
    this.addEmpty();
    this.addButton('c', event => (this.rm(this)));
    this.addButton('del', event => (this.del(this)));
    this.addButton('(-)', this.add, [this, "-"]);
    this.addButton('⬇', event => this.updateIndex(1));
    this.addEmpty();
    this.addButton(7, this.add, [this, "7"]);
    this.addButton(8, this.add, [this, "8"]);
    this.addButton(9, this.add, [this, "9"]);
    this.addButton("+", this.add, [this, "+"]);
    this.addEmpty();

    this.addButton(4, this.add, [this, "4"]);
    this.addButton(5, this.add, [this, "5"]);
    this.addButton(6, this.add, [this, "6"]);
    this.addButton("−", this.add, [this, "−"]);
    this.addEmpty();
    this.addButton(1, this.add, [this, "1"]);
    this.addButton(2, this.add, [this, "2"]);
    this.addButton(3, this.add, [this, "3"]);
    this.addButton("×", this.add, [this, "*"]);
    this.addButton("(", this.add, [this, "("]);
    this.addButton(")", this.add, [this, ")"]);
    this.addButton(0, this.add, [this, "0"]);
    this.addButton(",", this.add, [this, "."]);
    this.addButton('=', event => (this.calc(this)));
    this.addButton("÷", this.add, [this, "/"]);
    this.showButton();
  }

  showButton() {
    for (let i = 0; i < this.buttons.length; i++) {
      this.stage.appendChild(this.buttons[i]);
    }
  }

  addButton(name, func, val) {
    let b = HH.create("div");
    b.textContent = name;
    b.addEventListener('click', event => func(event, val));
    SS.style(b, {
      "fontSize": "20px",
      "textDecoration": "none",
      "width": "20%",
      "height": "30px",
      "float": "left",
      "textAlign": "center",
      "hover": "#505050",
      "cursor": "pointer",
      "scrollbar-height": null
    });
    this.buttons.push(b);
  }

  errored() {
    return this.mvc.controller.errored();
  }

  addEmpty() {
    let b = HH.create("div");
    SS.style(b, {
      "width": "20%",
      "height": "30px",
      "float": "left",
    });
    this.buttons.push(b);
  }

  // using model
  add(event, arg) {
    if (arg[0].errored()) {
      arg[0].h.textContent = arg[1]
      arg[0].mvc.model.errored = false;
    } else arg[0].h.textContent += arg[1];
    arg[0].mvc.model.hIndex = arg[0].mvc.model.history.length;
    arg[0].h.scrollTo(arg[0].h.textContent.length * 20, 0);
  }

  // delete one character
  del(arg) {
    if (arg.errored()) arg.h.textContent = "";
    let res = "";
    for (let i = 0; i < arg.h.textContent.length - 1; res += arg.h.textContent[i], i++); {}
    arg.h.textContent = res;
  }

  // delete all character
  rm(arg) {
    arg.h.textContent = "";
    this.mvc.controller.setIndex(arg.mvc.model.history.length);
  }

  //request getResult from controller
  calc(arg) {
    this.mvc.controller.getResult(arg);
  }

  updateIndex(w) {
    this.mvc.controller.updateHIndex(w)
  }

  memoryClear(arg) {
    arg.mvc.controller.memoryClear(arg);
  }

  memoryAdd(arg) {
    arg.mvc.controller.memoryAdd(arg);
  }

  memorySub(arg) {
    arg.mvc.controller.memorySub(arg);
  }

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

  setField(val) {
    this.mvc.view.h.textContent = val;
  }

  getVal() {
    return this.mvc.view.h;
  }

  getResult(arg) {
    return this.mvc.model.getResult(arg);
  }

  setIndex(w) {
    this.mvc.model.hIndex = w;
  }

  updateHIndex(w) {
    this.mvc.model.hIndex += w;
    this.setIndex((this.mvc.model.hIndex > this.mvc.model.history.length) ? this.mvc.model.history.length : this.mvc.model.hIndex);
    this.mvc.model.hIndex = (this.mvc.model.hIndex < 0) ? 0 : this.mvc.model.hIndex;
    this.setField(this.mvc.model.history[this.mvc.model.hIndex]);
  }

  errored() {
    return this.mvc.model.errored;
  }

  memoryClear() {
    this.mvc.model.memory = 0;
  }

  memoryAdd(arg) {
    this.mvc.model.memoryAdd(arg.h.textContent);
  }

  memorySub(arg) {
    this.mvc.model.memorySub(arg.h.textContent);
  }

  memoryShow() {
    this.setField(this.mvc.model.memory);
  }
}