import { ICustomField } from './challan.interface';

// Helper function to evaluate formula (placeholder for now)
export const evaluateFormula = (
  formula: string,
  customFields: Record<string, ICustomField>,
): string => {
  // Replace field IDs with their values
  let evaluatableFormula = formula;
  console.log(evaluatableFormula);
  for (const [fieldId, field] of Object.entries(customFields)) {
    const regex = new RegExp(fieldId, 'g');
    evaluatableFormula = evaluatableFormula.replace(regex, field.value);
  }
  console.log(evaluatableFormula);
  try {
    // Evaluate the formula using JavaScript's eval
    // This is safe since we control the input formula format
    const result = eval(evaluatableFormula);

    // Convert to string with 2 decimal places
    return Number(result).toFixed(2);
  } catch (error) {
    console.error('Error evaluating formula:', error);
    return '0';
  }
};
