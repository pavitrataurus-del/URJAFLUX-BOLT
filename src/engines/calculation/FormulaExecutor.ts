import { FormulaDefinition, CalculationContext, FormulaType } from "./CalculationTypes";

/**
 * Safe Mathematical Expression Evaluator.
 * Avoids 'eval' entirely to guarantee sandboxed security and strict runtime safety.
 * Handles +, -, *, /, %, ^, parenthesis, and variables.
 */
export class SafeMathParser {
  private tokens: string[] = [];
  private position = 0;

  constructor(expression: string) {
    this.tokenize(expression);
  }

  private tokenize(expr: string): void {
    // Standard regular expression to extract numbers, identifiers, operators, and parenthesis
    const regex = /\s*([A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|[-+*/%^()])/g;
    let match;
    this.tokens = [];
    while ((match = regex.exec(expr)) !== null) {
      this.tokens.push(match[1]);
    }
    this.position = 0;
  }

  private peek(): string | undefined {
    return this.tokens[this.position];
  }

  private consume(): string {
    return this.tokens[this.position++];
  }

  /**
   * Evaluates the prepared expression with runtime variable resolutions.
   */
  public evaluate(variables: Record<string, number>): number {
    try {
      const result = this.parseExpression(variables);
      if (this.position < this.tokens.length) {
        throw new Error(`Unexpected token at position ${this.position}: ${this.tokens[this.position]}`);
      }
      return result;
    } catch (err: unknown) {
      console.warn(`[SafeMathParser] Error during evaluation: ${err instanceof Error ? err.message : String(err)}`);
      return 0;
    }
  }

  private parseExpression(variables: Record<string, number>): number {
    let result = this.parseTerm(variables);
    while (this.peek() === "+" || this.peek() === "-") {
      const op = this.consume();
      const right = this.parseTerm(variables);
      if (op === "+") result += right;
      else result -= right;
    }
    return result;
  }

  private parseTerm(variables: Record<string, number>): number {
    let result = this.parsePower(variables);
    while (this.peek() === "*" || this.peek() === "/" || this.peek() === "%") {
      const op = this.consume();
      const right = this.parsePower(variables);
      if (op === "*") {
        result *= right;
      } else if (op === "/") {
        result = right === 0 ? 0 : result / right;
      } else {
        result = right === 0 ? 0 : result % right;
      }
    }
    return result;
  }

  private parsePower(variables: Record<string, number>): number {
    let result = this.parsePrimary(variables);
    while (this.peek() === "^") {
      this.consume(); // consume ^
      const right = this.parsePrimary(variables);
      result = Math.pow(result, right);
    }
    return result;
  }

  private parsePrimary(variables: Record<string, number>): number {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    if (token === "(") {
      this.consume(); // consume (
      const result = this.parseExpression(variables);
      if (this.consume() !== ")") throw new Error("Expected closing parenthesis");
      return result;
    }

    if (token === "-") {
      this.consume(); // unary minus
      return -this.parsePrimary(variables);
    }

    this.consume();

    // Check if it's a numeric literal
    const num = Number(token);
    if (!isNaN(num)) {
      return num;
    }

    // Check if it's a known constant
    if (token === "PI" || token === "pi") return Math.PI;
    if (token === "E" || token === "e") return Math.E;

    // Resolve as a variable or default to 0
    return variables[token] ?? 0;
  }
}

/**
 * Executor orchestrator managing mathematical, geometric, and proportional calculation formulas.
 */
export class FormulaExecutor {
  /**
   * Evaluates a defined formula under a given calculation context.
   */
  public static execute(formula: FormulaDefinition, context: CalculationContext): number {
    // Gather variables for current evaluation
    const inputs: Record<string, number> = {};
    formula.inputs.forEach(input => {
      // Priority 1: Check existing variables in the CalculationContext
      if (input in context.variables) {
        inputs[input] = context.variables[input];
      } else if (input === "northAngle") {
        inputs[input] = context.compass.northAngle;
      } else {
        // Priority 2: Extract from spatial rooms or boundaries if applicable
        const matchingRoom = context.spatialData.rooms.find(r => r.name.toLowerCase() === input.toLowerCase() || r.type === input);
        if (matchingRoom) {
          inputs[`${input}_area`] = matchingRoom.areaMeters ?? 0;
          inputs[`${input}_length`] = matchingRoom.length ?? 0;
          inputs[`${input}_width`] = matchingRoom.width ?? 0;
          // default mapping: use area
          inputs[input] = matchingRoom.areaMeters ?? 0;
        } else {
          inputs[input] = 0;
        }
      }
    });

    // Handle each FormulaType natively
    switch (formula.type) {
      case "ARITHMETIC":
        return this.executeArithmetic(formula.expression, inputs);

      case "PERCENTAGE":
        return this.executePercentage(formula, inputs);

      case "RATIO":
        return this.executeRatio(formula, inputs);

      case "DISTANCE":
        return this.executeDistance(formula, context);

      case "ANGLE":
        return this.executeAngle(formula, context);

      case "WEIGHTED_SCORE":
        return this.executeWeightedScore(formula, inputs);

      case "CUSTOM":
        return this.executeCustom(formula, context, inputs);

      default:
        console.warn(`[FormulaExecutor] Unknown formula type: ${formula.type}`);
        return 0;
    }
  }

  private static executeArithmetic(expression: string, variables: Record<string, number>): number {
    const parser = new SafeMathParser(expression);
    return parser.evaluate(variables);
  }

  private static executePercentage(formula: FormulaDefinition, variables: Record<string, number>): number {
    const valKey = formula.inputs[0];
    const totalKey = formula.inputs[1];
    const value = variables[valKey] ?? 0;
    const total = variables[totalKey] ?? 0;

    const opType = String(formula.config?.mode || "fraction");
    if (opType === "difference") {
      if (total === 0) return 0;
      return (Math.abs(value - total) / total) * 100;
    }

    if (total === 0) return 0;
    return (value / total) * 100;
  }

  private static executeRatio(formula: FormulaDefinition, variables: Record<string, number>): number {
    const numerKey = formula.inputs[0];
    const denomKey = formula.inputs[1];
    const numerator = variables[numerKey] ?? 0;
    const denominator = variables[denomKey] ?? 1;

    if (denominator === 0) return 0;
    const currentRatio = numerator / denominator;

    const targetRatio = Number(formula.config?.target || 1.618); // default Golden Ratio
    const tolerance = Number(formula.config?.tolerance || 0.1);

    const checkProximity = formula.config?.checkProximity === true;
    if (checkProximity) {
      const diff = Math.abs(currentRatio - targetRatio);
      return diff <= tolerance ? 1 : 0; // return 1 if matches proportional constraints
    }

    return currentRatio;
  }

  private static executeDistance(formula: FormulaDefinition, context: CalculationContext): number {
    // Requires points coordinates
    const p1Key = String(formula.config?.point1 || "p1");
    const p2Key = String(formula.config?.point2 || "p2");

    const p1 = context.pluginContext[p1Key] as { x: number; y: number } | undefined;
    const p2 = context.pluginContext[p2Key] as { x: number; y: number } | undefined;

    if (!p1 || !p2) {
      console.warn(`[FormulaExecutor] Distance calculation missing coordinate points for keys: ${p1Key}, ${p2Key}`);
      return 0;
    }

    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  private static executeAngle(formula: FormulaDefinition, context: CalculationContext): number {
    const p1Key = String(formula.config?.point1 || "p1");
    const p2Key = String(formula.config?.point2 || "p2");

    const p1 = context.pluginContext[p1Key] as { x: number; y: number } | undefined;
    const p2 = context.pluginContext[p2Key] as { x: number; y: number } | undefined;

    if (!p1 || !p2) {
      // Fallback: evaluate standard orientation relative to magnetic North
      return context.compass.northAngle;
    }

    const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let deg = rad * (180 / Math.PI);
    if (deg < 0) deg += 360;
    return deg;
  }

  private static executeWeightedScore(formula: FormulaDefinition, variables: Record<string, number>): number {
    const weights = (formula.config?.weights as Record<string, number>) || {};
    let totalScore = 0;
    let totalWeight = 0;

    formula.inputs.forEach(input => {
      const score = variables[input] ?? 0;
      const weight = weights[input] ?? 1.0;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight === 0 ? 0 : totalScore / totalWeight;
  }

  private static executeCustom(formula: FormulaDefinition, context: CalculationContext, variables: Record<string, number>): number {
    // Native implementations of traditional formulas (e.g. Ayadi Yoni ratios, nakshatra checks)
    if (formula.expression === "AYADI_YONI") {
      const area = variables["area"] || variables["plotArea"] || 0;
      // Formula: (Area * 8) % 12
      return (area * 8) % 12;
    }

    if (formula.expression === "AYADI_AYA") {
      const area = variables["area"] || variables["plotArea"] || 0;
      // Formula: (Area * 9) % 74
      return (area * 9) % 74;
    }

    if (formula.expression === "AYADI_VYAYA") {
      const area = variables["area"] || variables["plotArea"] || 0;
      // Formula: (Area * 9) % 10
      return (area * 9) % 10;
    }

    console.warn(`[FormulaExecutor] Unsupported custom calculation: ${formula.expression}`);
    return 0;
  }
}
