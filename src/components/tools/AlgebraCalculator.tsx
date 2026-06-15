"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/CopyButton";

// ── Token types ──────────────────────────────────────────────────────────
type TokenType =
  | "NUMBER"
  | "IDENT"
  | "PLUS"
  | "MINUS"
  | "MUL"
  | "DIV"
  | "CARET"
  | "LPAREN"
  | "RPAREN"
  | "EQ"
  | "FUNC"
  | "EOF";

interface Token {
  type: TokenType;
  value: string;
}

// ── Lexer ────────────────────────────────────────────────────────────────
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const src = input.replace(/\s+/g, "");

  while (i < src.length) {
    const ch = src[i];

    if (ch >= "0" && ch <= "9" || ch === ".") {
      let num = "";
      while (i < src.length && (src[i] >= "0" && src[i] <= "9" || src[i] === ".")) {
        num += src[i++];
      }
      tokens.push({ type: "NUMBER", value: num });
      continue;
    }

    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z")) {
      let ident = "";
      while (
        i < src.length &&
        ((src[i] >= "a" && src[i] <= "z") ||
          (src[i] >= "A" && src[i] <= "Z") ||
          (src[i] >= "0" && src[i] <= "9"))
      ) {
        ident += src[i++];
      }
      const funcs = ["sqrt", "sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "abs", "exp"];
      if (funcs.includes(ident.toLowerCase())) {
        tokens.push({ type: "FUNC", value: ident.toLowerCase() });
      } else if (ident === "pi") {
        tokens.push({ type: "NUMBER", value: String(Math.PI) });
      } else if (ident === "e") {
        tokens.push({ type: "NUMBER", value: String(Math.E) });
      } else {
        tokens.push({ type: "IDENT", value: ident });
      }
      continue;
    }

    const simple: Record<string, TokenType> = {
      "+": "PLUS",
      "-": "MINUS",
      "*": "MUL",
      "/": "DIV",
      "^": "CARET",
      "(": "LPAREN",
      ")": "RPAREN",
      "=": "EQ",
    };

    if (simple[ch]) {
      tokens.push({ type: simple[ch], value: ch });
      i++;
      continue;
    }

    // skip unknown
    i++;
  }

  tokens.push({ type: "EOF", value: "" });
  return tokens;
}

// ── AST ──────────────────────────────────────────────────────────────────
type Expr =
  | { type: "num"; value: number }
  | { type: "var"; name: string }
  | { type: "bin"; op: string; left: Expr; right: Expr }
  | { type: "unary"; op: string; operand: Expr }
  | { type: "func"; name: string; arg: Expr };

// ── Recursive-descent parser ─────────────────────────────────────────────
class Parser {
  private tokens: Token[];
  private pos: number;
  public steps: string[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
    this.steps = [];
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const t = this.advance();
    if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type}`);
    return t;
  }

  parse(): Expr {
    const expr = this.parseAddSub();
    return expr;
  }

  private parseAddSub(): Expr {
    let left = this.parseMulDiv();
    while (this.peek().type === "PLUS" || this.peek().type === "MINUS") {
      const op = this.advance().value;
      const right = this.parseMulDiv();
      left = { type: "bin", op, left, right };
    }
    return left;
  }

  private parseMulDiv(): Expr {
    let left = this.parseUnary();
    while (
      this.peek().type === "MUL" ||
      this.peek().type === "DIV" ||
      // Implicit multiplication: NUMBER IDENT, NUMBER LPAREN, IDENT LPAREN, etc.
      ((left.type === "num" || left.type === "var") &&
        (this.peek().type === "IDENT" || this.peek().type === "FUNC" || this.peek().type === "LPAREN"))
    ) {
      if (this.peek().type === "MUL" || this.peek().type === "DIV") {
        const op = this.advance().value;
        const right = this.parseUnary();
        left = { type: "bin", op, left, right };
      } else {
        // Implicit multiplication (e.g., 2x, 2(x+1), x(x+1))
        const right = this.parseUnary();
        left = { type: "bin", op: "*", left, right };
      }
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.peek().type === "MINUS") {
      this.advance();
      const operand = this.parseUnary();
      return { type: "unary", op: "-", operand };
    }
    if (this.peek().type === "PLUS") {
      this.advance();
      return this.parseUnary();
    }
    return this.parsePower();
  }

  private parsePower(): Expr {
    let base = this.parsePostfix();
    if (this.peek().type === "CARET") {
      this.advance();
      const exp = this.parseUnary(); // right-associative
      base = { type: "bin", op: "^", left: base, right: exp };
    }
    return base;
  }

  private parsePostfix(): Expr {
    const atom = this.parseAtom();
    return atom;
  }

  private parseAtom(): Expr {
    const t = this.peek();

    if (t.type === "NUMBER") {
      this.advance();
      return { type: "num", value: parseFloat(t.value) };
    }

    if (t.type === "FUNC") {
      this.advance();
      this.expect("LPAREN");
      const arg = this.parseAddSub();
      this.expect("RPAREN");
      return { type: "func", name: t.value, arg };
    }

    if (t.type === "IDENT") {
      this.advance();
      return { type: "var", name: t.value };
    }

    if (t.type === "LPAREN") {
      this.advance();
      const expr = this.parseAddSub();
      this.expect("RPAREN");
      return expr;
    }

    throw new Error(`Unexpected token: ${t.type} ("${t.value}")`);
  }
}

// ── Evaluate AST (numeric) ──────────────────────────────────────────────
function evaluate(expr: Expr, vars: Record<string, number>): number {
  switch (expr.type) {
    case "num":
      return expr.value;
    case "var":
      if (expr.name in vars) return vars[expr.name];
      throw new Error(`Unknown variable: ${expr.name}`);
    case "bin": {
      const l = evaluate(expr.left, vars);
      const r = evaluate(expr.right, vars);
      switch (expr.op) {
        case "+": return l + r;
        case "-": return l - r;
        case "*": return l * r;
        case "/":
          if (r === 0) throw new Error("Division by zero");
          return l / r;
        case "^": return Math.pow(l, r);
        default: throw new Error(`Unknown operator: ${expr.op}`);
      }
    }
    case "unary": {
      const val = evaluate(expr.operand, vars);
      return expr.op === "-" ? -val : val;
    }
    case "func": {
      const arg = evaluate(expr.arg, vars);
      switch (expr.name) {
        case "sqrt": return Math.sqrt(arg);
        case "sin": return Math.sin(arg);
        case "cos": return Math.cos(arg);
        case "tan": return Math.tan(arg);
        case "asin": return Math.asin(arg);
        case "acos": return Math.acos(arg);
        case "atan": return Math.atan(arg);
        case "log": return Math.log10(arg);
        case "ln": return Math.log(arg);
        case "abs": return Math.abs(arg);
        case "exp": return Math.exp(arg);
        default: throw new Error(`Unknown function: ${expr.name}`);
      }
    }
  }
}

// ── Expression to string ────────────────────────────────────────────────
function exprToString(expr: Expr): string {
  switch (expr.type) {
    case "num":
      return Number.isInteger(expr.value) ? String(expr.value) : expr.value.toFixed(4).replace(/\.?0+$/, "");
    case "var":
      return expr.name;
    case "bin": {
      const l = exprToString(expr.left);
      const r = exprToString(expr.right);
      return `${l} ${expr.op} ${r}`;
    }
    case "unary":
      return `${expr.op}${exprToString(expr.operand)}`;
    case "func":
      return `${expr.name}(${exprToString(expr.arg)})`;
  }
}

// ── Check if AST contains variable ──────────────────────────────────────
function hasVariable(expr: Expr, name: string): boolean {
  switch (expr.type) {
    case "num": return false;
    case "var": return expr.name === name;
    case "bin": return hasVariable(expr.left, name) || hasVariable(expr.right, name);
    case "unary": return hasVariable(expr.operand, name);
    case "func": return hasVariable(expr.arg, name);
  }
}

// ── Simplify: collect variable terms to form ax + b = 0 ─────────────────
function collectLinearCoeffs(expr: Expr, varName: string): { a: number; b: number } {
  // Evaluate the expression symbolically, treating varName as (a * varName + b)
  switch (expr.type) {
    case "num":
      return { a: 0, b: expr.value };
    case "var":
      return expr.name === varName ? { a: 1, b: 0 } : { a: 0, b: 0 };
    case "unary": {
      const inner = collectLinearCoeffs(expr.operand, varName);
      return expr.op === "-" ? { a: -inner.a, b: -inner.b } : inner;
    }
    case "bin": {
      const l = collectLinearCoeffs(expr.left, varName);
      const r = collectLinearCoeffs(expr.right, varName);
      switch (expr.op) {
        case "+": return { a: l.a + r.a, b: l.b + r.b };
        case "-": return { a: l.a - r.a, b: l.b - r.b };
        case "*": {
          // one side must be constant
          if (l.a === 0) return { a: l.b * r.a, b: l.b * r.b };
          if (r.a === 0) return { a: l.a * r.b, b: l.b * r.b };
          throw new Error("Non-linear equation (contains variable * variable)");
        }
        case "/": {
          if (r.a !== 0) throw new Error("Non-linear equation (variable in denominator)");
          if (r.b === 0) throw new Error("Division by zero");
          return { a: l.a / r.b, b: l.b / r.b };
        }
        case "^": {
          if (r.a !== 0) throw new Error("Non-linear equation (variable in exponent)");
          if (r.b !== 1) throw new Error("Non-linear equation (exponent is not 1)");
          return l;
        }
        default: throw new Error(`Unknown operator: ${expr.op}`);
      }
    }
    case "func": {
      if (hasVariable(expr, varName)) {
        throw new Error(`Cannot solve equations containing ${expr.name}(...) with variables`);
      }
      const argVal = evaluate(expr.arg, {});
      return { a: 0, b: evaluate({ type: "func", name: expr.name, arg: { type: "num", value: argVal } }, {}) };
    }
  }
}

// ── Step-by-step linear equation solver ──────────────────────────────────
function solveLinearEquation(
  left: Expr,
  right: Expr,
  varName: string
): { solution: string; steps: string[] } {
  const steps: string[] = [];

  steps.push(`Original equation: ${exprToString(left)} = ${exprToString(right)}`);

  // Move everything to the left: left - right = 0
  const combined: Expr = { type: "bin", op: "-", left, right };
  steps.push(`Move all terms to one side: ${exprToString(combined)} = 0`);

  const { a, b } = collectLinearCoeffs(combined, varName);
  steps.push(`Simplify to standard form: ${a}${varName} + (${b}) = 0`);
  steps.push(`Collect constant: ${a}${varName} = ${-b}`);

  if (a === 0) {
    if (b === 0) {
      steps.push("0 = 0 is always true -> infinite solutions (identity)");
      return { solution: "All real numbers", steps };
    } else {
      steps.push(`${b} = 0 is false -> no solution (contradiction)`);
      return { solution: "No solution", steps };
    }
  }

  const result = -b / a;
  steps.push(`Divide both sides by ${a}: ${varName} = ${-b} / ${a}`);
  const displayResult = Number.isInteger(result) ? String(result) : result.toFixed(6).replace(/\.?0+$/, "");
  steps.push(`Solution: ${varName} = ${displayResult}`);
  return { solution: `${varName} = ${displayResult}`, steps };
}

// ── Main component ──────────────────────────────────────────────────────
export default function AlgebraCalculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"expression" | "equation">("expression");

  const detectMode = useCallback((text: string): "expression" | "equation" => {
    // Check for = sign not inside function parens
    let depth = 0;
    for (const ch of text) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (ch === "=" && depth === 0) return "equation";
    }
    return "expression";
  }, []);

  const handleSolve = useCallback(() => {
    setError(null);
    setResult(null);
    setSteps([]);

    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter an expression or equation.");
      return;
    }

    try {
      const detected = detectMode(trimmed);
      setMode(detected);

      if (detected === "equation") {
        // Split on = (at depth 0)
        let eqIdx = -1;
        let depth = 0;
        for (let i = 0; i < trimmed.length; i++) {
          if (trimmed[i] === "(") depth++;
          else if (trimmed[i] === ")") depth--;
          else if (trimmed[i] === "=" && depth === 0) {
            eqIdx = i;
            break;
          }
        }

        if (eqIdx < 0) {
          setError("Invalid equation format.");
          return;
        }

        const leftStr = trimmed.substring(0, eqIdx);
        const rightStr = trimmed.substring(eqIdx + 1);

        const leftTokens = tokenize(leftStr);
        const rightTokens = tokenize(rightStr);

        const leftParser = new Parser(leftTokens);
        const rightParser = new Parser(rightTokens);

        const leftExpr = leftParser.parse();
        const rightExpr = rightParser.parse();

        // Determine which variable to solve for
        const varNames = new Set<string>();
        const collectVars = (e: Expr): void => {
          if (e.type === "var") varNames.add(e.name);
          if (e.type === "bin") { collectVars(e.left); collectVars(e.right); }
          if (e.type === "unary") collectVars(e.operand);
          if (e.type === "func") collectVars(e.arg);
        };
        collectVars(leftExpr);
        collectVars(rightExpr);

        const varName = varNames.size === 1 ? Array.from(varNames)[0] : "x";

        const { solution, steps: solveSteps } = solveLinearEquation(leftExpr, rightExpr, varName);
        setSteps(solveSteps);
        setResult(solution);
      } else {
        // Evaluate expression
        const tokens = tokenize(trimmed);
        const parser = new Parser(tokens);
        const expr = parser.parse();

        const evalResult = evaluate(expr, {});
        const displayResult = Number.isInteger(evalResult)
          ? String(evalResult)
          : evalResult.toFixed(8).replace(/\.?0+$/, "");

        const exprStr = exprToString(expr);
        setSteps([
          `Expression: ${exprStr}`,
          `Evaluate: ${displayResult}`,
        ]);
        setResult(displayResult);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [input, detectMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSolve();
  };

  return (
    <div className="space-y-6">
      {/* Mode indicator */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-surface-200 dark:border-surface-800 overflow-hidden">
          <button
            onClick={() => setMode("expression")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "expression"
                ? "bg-brand-600 text-white"
                : "bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800"
            }`}
          >
            Expression
          </button>
          <button
            onClick={() => setMode("equation")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "equation"
                ? "bg-brand-600 text-white"
                : "bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800"
            }`}
          >
            Equation
          </button>
        </div>
      </div>

      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {mode === "equation" ? "Equation (e.g., 2x + 3 = 7)" : "Expression (e.g., sqrt(16) + 2^3)"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1 font-mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "equation"
                ? "2x + 3 = 7"
                : "sqrt(16) + 2^3"
            }
          />
          <button onClick={handleSolve} className="btn-primary whitespace-nowrap">
            {mode === "equation" ? "Solve" : "Evaluate"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">Error</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-mono">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Result</h3>
            <CopyButton text={result} />
          </div>
          <p className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400">{result}</p>
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Step-by-Step Solution
          </h3>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm font-mono text-surface-700 dark:text-surface-300 pt-0.5">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Supported functions reference */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Supported Syntax
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="font-medium text-surface-700 dark:text-surface-300">Operators:</span>
            <span className="ml-2 text-surface-500 dark:text-surface-400 font-mono">+ - * / ^</span>
          </div>
          <div>
            <span className="font-medium text-surface-700 dark:text-surface-300">Functions:</span>
            <span className="ml-2 text-surface-500 dark:text-surface-400 font-mono">sqrt sin cos tan</span>
          </div>
          <div>
            <span className="font-medium text-surface-700 dark:text-surface-300">More functions:</span>
            <span className="ml-2 text-surface-500 dark:text-surface-400 font-mono">asin acos atan log ln abs exp</span>
          </div>
          <div>
            <span className="font-medium text-surface-700 dark:text-surface-300">Constants:</span>
            <span className="ml-2 text-surface-500 dark:text-surface-400 font-mono">pi e</span>
          </div>
          <div>
            <span className="font-medium text-surface-700 dark:text-surface-300">Equations:</span>
            <span className="ml-2 text-surface-500 dark:text-surface-400 font-mono">2x + 3 = 7</span>
          </div>
          <div>
            <span className="font-medium text-surface-700 dark:text-surface-300">Grouping:</span>
            <span className="ml-2 text-surface-500 dark:text-surface-400 font-mono">( ) parentheses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
