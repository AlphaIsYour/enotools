"use client";

import { useState, useCallback } from "react";

interface HistoryEntry {
  expression: string;
  result: string;
}

export default function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [memory, setMemory] = useState(0);
  const [isNewInput, setIsNewInput] = useState(true);
  const [isDeg, setIsDeg] = useState(true);
  const [parenCount, setParenCount] = useState(0);

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const fromRad = (rad: number) => (rad * 180) / Math.PI;

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const formatNumber = (n: number): string => {
    if (isNaN(n)) return "Error";
    if (!isFinite(n)) return n > 0 ? "Infinity" : "-Infinity";
    if (Math.abs(n) < 1e-15) return "0";
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-6 && n !== 0)) {
      return n.toExponential(8);
    }
    const str = n.toPrecision(12);
    return parseFloat(str).toString();
  };

  const addHistory = useCallback((expr: string, result: string) => {
    setHistory((prev) => [{ expression: expr, result }, ...prev].slice(0, 10));
  }, []);

  const handleDigit = (digit: string) => {
    if (isNewInput) {
      setDisplay(digit);
      setIsNewInput(false);
    } else {
      setDisplay((prev) => (prev === "0" ? digit : prev + digit));
    }
  };

  const handleDecimal = () => {
    if (isNewInput) {
      setDisplay("0.");
      setIsNewInput(false);
    } else if (!display.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  };

  const handleOperator = (op: string) => {
    const sym = op === "*" ? "x" : op === "/" ? "÷" : op;
    setExpression((prev) => prev + display + " " + sym + " ");
    setIsNewInput(true);
  };

  const handleEquals = () => {
    try {
      const fullExpr = expression + display;
      // Build a sanitized expression for evaluation
      let evalExpr = fullExpr
        .replace(/\^/g, "**")
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/--/g, "+");

      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${evalExpr})`)();
      const formatted = formatNumber(result);
      addHistory(fullExpr, formatted);
      setDisplay(formatted);
      setExpression("");
      setIsNewInput(true);
      setParenCount(0);
    } catch {
      setDisplay("Error");
      setExpression("");
      setIsNewInput(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
    setIsNewInput(true);
    setParenCount(0);
  };

  const handleClearEntry = () => {
    setDisplay("0");
    setIsNewInput(true);
  };

  const handleBackspace = () => {
    if (display.length <= 1 || (display.length === 2 && display[0] === "-")) {
      setDisplay("0");
      setIsNewInput(true);
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handleNegate = () => {
    setDisplay((prev) => {
      if (prev === "0") return prev;
      return prev.startsWith("-") ? prev.slice(1) : "-" + prev;
    });
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(formatNumber(val / 100));
      setIsNewInput(true);
    }
  };

  const handleParen = (p: string) => {
    if (p === "(") {
      setExpression((prev) => prev + "(");
      setParenCount((c) => c + 1);
      setIsNewInput(true);
    } else if (p === ")" && parenCount > 0) {
      setExpression((prev) => prev + display + ")");
      setParenCount((c) => c - 1);
      setIsNewInput(true);
    }
  };

  const handleFunction = (fn: string) => {
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let result: number;
    let exprStr = "";

    switch (fn) {
      case "sin":
        result = Math.sin(isDeg ? toRad(val) : val);
        exprStr = `sin(${val})`;
        break;
      case "cos":
        result = Math.cos(isDeg ? toRad(val) : val);
        exprStr = `cos(${val})`;
        break;
      case "tan":
        result = Math.tan(isDeg ? toRad(val) : val);
        exprStr = `tan(${val})`;
        break;
      case "asin":
        result = isDeg ? fromRad(Math.asin(val)) : Math.asin(val);
        exprStr = `asin(${val})`;
        break;
      case "acos":
        result = isDeg ? fromRad(Math.acos(val)) : Math.acos(val);
        exprStr = `acos(${val})`;
        break;
      case "atan":
        result = isDeg ? fromRad(Math.atan(val)) : Math.atan(val);
        exprStr = `atan(${val})`;
        break;
      case "log":
        result = Math.log10(val);
        exprStr = `log(${val})`;
        break;
      case "ln":
        result = Math.log(val);
        exprStr = `ln(${val})`;
        break;
      case "sqrt":
        result = Math.sqrt(val);
        exprStr = `sqrt(${val})`;
        break;
      case "x2":
        result = val * val;
        exprStr = `(${val})^2`;
        break;
      case "x3":
        result = val * val * val;
        exprStr = `(${val})^3`;
        break;
      case "1/x":
        result = 1 / val;
        exprStr = `1/(${val})`;
        break;
      case "fact":
        result = factorial(Math.floor(val));
        exprStr = `${Math.floor(val)}!`;
        break;
      case "exp":
        result = Math.exp(val);
        exprStr = `e^(${val})`;
        break;
      case "abs":
        result = Math.abs(val);
        exprStr = `|${val}|`;
        break;
      default:
        return;
    }

    const formatted = formatNumber(result);
    addHistory(exprStr, formatted);
    setDisplay(formatted);
    setIsNewInput(true);
  };

  const handlePower = () => {
    setExpression((prev) => prev + display + " ^ ");
    setIsNewInput(true);
  };

  const handleConstant = (c: string) => {
    if (c === "pi") {
      setDisplay(formatNumber(Math.PI));
    } else if (c === "e") {
      setDisplay(formatNumber(Math.E));
    }
    setIsNewInput(true);
  };

  const handleMemory = (action: string) => {
    const val = parseFloat(display);
    switch (action) {
      case "MC":
        setMemory(0);
        break;
      case "MR":
        setDisplay(formatNumber(memory));
        setIsNewInput(true);
        break;
      case "M+":
        if (!isNaN(val)) setMemory((m) => m + val);
        setIsNewInput(true);
        break;
      case "M-":
        if (!isNaN(val)) setMemory((m) => m - val);
        setIsNewInput(true);
        break;
    }
  };

  interface ButtonDef {
    label: string;
    action: () => void;
    className?: string;
    span?: number;
  }

  const funcButtons: ButtonDef[] = [
    { label: "sin", action: () => handleFunction("sin"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "cos", action: () => handleFunction("cos"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "tan", action: () => handleFunction("tan"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "log", action: () => handleFunction("log"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "ln", action: () => handleFunction("ln"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
  ];

  const funcButtons2: ButtonDef[] = [
    { label: "sin⁻¹", action: () => handleFunction("asin"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "cos⁻¹", action: () => handleFunction("acos"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "tan⁻¹", action: () => handleFunction("atan"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "x²", action: () => handleFunction("x2"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "x³", action: () => handleFunction("x3"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
  ];

  const funcButtons3: ButtonDef[] = [
    { label: "√", action: () => handleFunction("sqrt"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "xⁿ", action: handlePower, className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "1/x", action: () => handleFunction("1/x"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "n!", action: () => handleFunction("fact"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "|x|", action: () => handleFunction("abs"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
  ];

  const memoryButtons: ButtonDef[] = [
    { label: "MC", action: () => handleMemory("MC"), className: "bg-surface-100 dark:bg-surface-800 text-xs text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "MR", action: () => handleMemory("MR"), className: "bg-surface-100 dark:bg-surface-800 text-xs text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "M+", action: () => handleMemory("M+"), className: "bg-surface-100 dark:bg-surface-800 text-xs text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "M-", action: () => handleMemory("M-"), className: "bg-surface-100 dark:bg-surface-800 text-xs text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700" },
  ];

  const mainButtons: ButtonDef[] = [
    { label: "C", action: handleClear, className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50" },
    { label: "CE", action: handleClearEntry, className: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50" },
    { label: "⌫", action: handleBackspace, className: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50" },
    { label: "÷", action: () => handleOperator("/"), className: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-900/50" },

    { label: "(", action: () => handleParen("("), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "7", action: () => handleDigit("7"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "8", action: () => handleDigit("8"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "9", action: () => handleDigit("9"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "x", action: () => handleOperator("*"), className: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-900/50" },

    { label: ")", action: () => handleParen(")"), className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "4", action: () => handleDigit("4"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "5", action: () => handleDigit("5"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "6", action: () => handleDigit("6"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "-", action: () => handleOperator("-"), className: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-900/50" },

    { label: "±", action: handleNegate, className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "1", action: () => handleDigit("1"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "2", action: () => handleDigit("2"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "3", action: () => handleDigit("3"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "+", action: () => handleOperator("+"), className: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-900/50" },

    { label: "%", action: handlePercent, className: "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" },
    { label: "0", action: () => handleDigit("0"), className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700", span: 2 },
    { label: ".", action: handleDecimal, className: "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700" },
    { label: "=", action: handleEquals, className: "bg-brand-600 text-white hover:bg-brand-700" },
  ];

  const renderButtonRow = (buttons: ButtonDef[]) =>
    buttons.map((btn, i) => (
      <button
        key={i}
        onClick={btn.action}
        className={`rounded-lg py-3 text-sm font-semibold transition-colors active:scale-95 ${btn.className || ""}`}
        style={btn.span ? { gridColumn: `span ${btn.span}` } : undefined}
      >
        {btn.label}
      </button>
    ));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            {/* Display */}
            <div className="rounded-lg bg-surface-50 dark:bg-surface-800 p-4 mb-4">
              <div className="text-right">
                <p className="text-sm text-surface-500 dark:text-surface-400 font-mono h-6 truncate">
                  {expression || " "}
                </p>
                <p className="text-3xl font-bold text-surface-900 dark:text-surface-100 font-mono truncate">
                  {display}
                </p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setIsDeg(!isDeg)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  isDeg
                    ? "bg-brand-600 text-white"
                    : "bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300"
                }`}
              >
                DEG
              </button>
              <button
                onClick={() => setIsDeg(!isDeg)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  !isDeg
                    ? "bg-brand-600 text-white"
                    : "bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300"
                }`}
              >
                RAD
              </button>
              <span className="text-xs text-surface-400 dark:text-surface-500 ml-auto">
                {memory !== 0 && `M = ${formatNumber(memory)}`}
              </span>
            </div>

            {/* Function row 1 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              {renderButtonRow(funcButtons)}
            </div>

            {/* Function row 2 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              {renderButtonRow(funcButtons2)}
            </div>

            {/* Function row 3 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              {renderButtonRow(funcButtons3)}
            </div>

            {/* Memory row */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              {renderButtonRow(memoryButtons)}
              <button
                onClick={() => handleFunction("exp")}
                className="rounded-lg py-3 text-sm font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                eˣ
              </button>
            </div>

            {/* Constants */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <button
                onClick={() => handleConstant("pi")}
                className="rounded-lg py-3 text-sm font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                &pi;
              </button>
              <button
                onClick={() => handleConstant("e")}
                className="rounded-lg py-3 text-sm font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                e
              </button>
              <div className="col-span-3" />
            </div>

            {/* Main button grid */}
            <div className="grid grid-cols-5 gap-2">
              {renderButtonRow(mainButtons)}
            </div>
          </div>
        </div>

        {/* History */}
        <div>
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              History
            </h3>
            {history.length === 0 ? (
              <p className="text-sm text-surface-400 dark:text-surface-500 italic">
                No calculations yet.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => { setDisplay(entry.result); setIsNewInput(true); }}
                    className="w-full text-left rounded-lg p-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors border border-surface-100 dark:border-surface-800"
                  >
                    <p className="text-xs text-surface-500 dark:text-surface-400 font-mono truncate">
                      {entry.expression}
                    </p>
                    <p className="text-lg font-bold text-surface-900 dark:text-surface-100 font-mono">
                      = {entry.result}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="mt-4 btn-secondary w-full text-sm text-red-600 dark:text-red-400"
              >
                Clear History
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
