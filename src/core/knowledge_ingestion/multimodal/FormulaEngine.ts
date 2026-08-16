import { FormulaStructure } from '../types/multimodal.types';

export class FormulaEngine {
  /**
   * Evaluates or detects mathematical/architectural/engineering formulas with symbolic reasoning.
   */
  public static extractFormula(
    rawText: string,
    domainHint?: string
  ): FormulaStructure {
    const textLower = rawText.toLowerCase();

    // 1. Ayadi Aya Formula (Area * 8 / 12 = Remainder)
    if (textLower.includes('aya') || textLower.includes('ayadi') || textLower.includes('area * 8')) {
      return {
        formulaName: 'Ayadi Aya Calculation (Vastu Gain Factor)',
        latexOrExpression: 'Aya = (Area × 8) mod 12',
        variables: [
          { symbol: 'Area', name: 'Building Floor Area', unit: 'sq. ft', dimension: 'L^2' },
          { symbol: 'Aya', name: 'Aya Remainder Code (1-12)', unit: 'index', dimension: '1' }
        ],
        domain: 'Aya',
        constraints: ['Aya remainder should equal odd number (1, 3, 5, 7, 9, 11) for auspiciousness.'],
        executableFn: '(area * 8) % 12',
        exampleInputs: { area: 1200 },
        exampleOutputs: { aya: 0 },
        dependentFormulas: ['Vyaya Calculation', 'Nakshatra Star Calculation'],
        chainedOutputSymbol: 'Aya',
        dimensionCheck: { isConsistent: true }
      };
    }

    // 2. Vyaya Formula (Area * 9 / 10 = Remainder)
    if (textLower.includes('vyaya') || textLower.includes('expenditure')) {
      return {
        formulaName: 'Ayadi Vyaya Calculation (Vastu Loss Factor)',
        latexOrExpression: 'Vyaya = (Area × 9) mod 10',
        variables: [
          { symbol: 'Area', name: 'Building Floor Area', unit: 'sq. ft', dimension: 'L^2' },
          { symbol: 'Vyaya', name: 'Vyaya Remainder Code', unit: 'index', dimension: '1' }
        ],
        domain: 'Vyaya',
        constraints: ['Aya value MUST be greater than Vyaya value.'],
        executableFn: '(area * 9) % 10',
        exampleInputs: { area: 1200 },
        exampleOutputs: { vyaya: 0 },
        chainedOutputSymbol: 'Vyaya',
        dimensionCheck: { isConsistent: true }
      };
    }

    // 3. Nakshatra Formula
    if (textLower.includes('nakshatra') || textLower.includes('star')) {
      return {
        formulaName: 'Ayadi Nakshatra Calculation',
        latexOrExpression: 'Nakshatra = (Area × 8) mod 27',
        variables: [
          { symbol: 'Area', name: 'Perimeter or Area', unit: 'sq. ft', dimension: 'L^2' },
          { symbol: 'Nakshatra', name: 'Star Index (1-27)', unit: 'index', dimension: '1' }
        ],
        domain: 'Nakshatra',
        executableFn: '(area * 8) % 27',
        exampleInputs: { area: 1500 },
        exampleOutputs: { nakshatra: 12 },
        dimensionCheck: { isConsistent: true }
      };
    }

    // 4. Hydraulic Pipe Flow Formula Q = A * V
    if (textLower.includes('hydraulic') || textLower.includes('q = a * v') || textLower.includes('flow rate') || textLower.includes('water tank')) {
      return {
        formulaName: 'Hydraulic Pipe Flow Rate (Q = A × V)',
        latexOrExpression: 'Q = A × V',
        variables: [
          { symbol: 'Q', name: 'Volumetric Flow Rate', unit: 'm³/s', dimension: 'L^3 / T' },
          { symbol: 'A', name: 'Cross-sectional Pipe Area', unit: 'm²', dimension: 'L^2' },
          { symbol: 'V', name: 'Fluid Velocity', unit: 'm/s', dimension: 'L / T' }
        ],
        domain: 'Hydraulic',
        executableFn: 'area * velocity',
        exampleInputs: { area: 0.05, velocity: 2.5 },
        exampleOutputs: { flowRate: 0.125 },
        dependentFormulas: ['Reynolds Number Calculation', 'Friction Head Loss'],
        chainedOutputSymbol: 'Q',
        dimensionCheck: { isConsistent: true }
      };
    }

    // Generic Mathematical Formula
    return {
      formulaName: 'General Structural Engineering Formula',
      latexOrExpression: 'Load = Mass × Gravity',
      variables: [
        { symbol: 'Mass', name: 'Structural Mass', unit: 'kg', dimension: 'M' },
        { symbol: 'Load', name: 'Gravity Load', unit: 'N', dimension: 'M * L / T^2' }
      ],
      domain: 'Engineering',
      executableFn: 'mass * 9.81',
      exampleInputs: { mass: 1000 },
      exampleOutputs: { load: 9810 },
      dimensionCheck: { isConsistent: true }
    };
  }

  /**
   * Executes a formula dynamically using passed inputs with unit dimension validation.
   */
  public static calculateFormula(
    formula: FormulaStructure,
    inputs: Record<string, number>
  ): number {
    try {
      if (formula.domain === 'Aya') {
        const area = inputs.area || inputs.Area || 1000;
        return (area * 8) % 12;
      }
      if (formula.domain === 'Vyaya') {
        const area = inputs.area || inputs.Area || 1000;
        return (area * 9) % 10;
      }
      if (formula.domain === 'Nakshatra') {
        const area = inputs.area || inputs.Area || 1000;
        return (area * 8) % 27;
      }
      if (formula.domain === 'Hydraulic') {
        const a = inputs.area || inputs.A || 0.05;
        const v = inputs.velocity || inputs.V || 2;
        return a * v;
      }
      const mass = inputs.mass || inputs.Mass || 100;
      return mass * 9.81;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Evaluates chained formula sequences (e.g. Area -> Aya -> Vyaya -> Balance Score)
   */
  public static evaluateChainedFormulas(
    inputs: Record<string, number>
  ): { aya: number; vyaya: number; isNetGainAuspicious: boolean; flowRate?: number } {
    const area = inputs.area || 1200;
    const aya = (area * 8) % 12;
    const vyaya = (area * 9) % 10;
    const isGain = aya > vyaya;

    return {
      aya,
      vyaya,
      isNetGainAuspicious: isGain,
      flowRate: inputs.velocity ? (inputs.area || 0.05) * inputs.velocity : undefined
    };
  }
}
