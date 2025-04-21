import { ICustomField } from './challan.interface';
import { ChallanTemplateField, FieldType } from '@prisma/client';

// Helper function to evaluate formula based on resolved dependencies
export const evaluateFormula = (
  formula: string,
  customFields: Record<string, ICustomField>,
): string => {
  // Replace field IDs with their values
  let evaluatableFormula = formula;
  for (const [fieldId, field] of Object.entries(customFields)) {
    const regex = new RegExp(fieldId, 'g');
    evaluatableFormula = evaluatableFormula.replace(regex, field.value);
  }

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

// Extract field IDs referenced in a formula
const extractDependenciesFromFormula = (
  formula: string,
  allFieldIds: string[],
): string[] => {
  if (!formula) return [];

  // Sort field IDs by length (descending) to handle cases where one ID might be a substring of another
  const sortedFieldIds = [...allFieldIds].sort((a, b) => b.length - a.length);

  const dependencies: string[] = [];

  // Check each field ID to see if it's referenced in the formula
  for (const fieldId of sortedFieldIds) {
    // Use word boundary to ensure we're matching whole field IDs
    const regex = new RegExp(`\\b${fieldId}\\b`, 'g');
    if (regex.test(formula)) {
      dependencies.push(fieldId);
    }
  }

  return dependencies;
};

// Build dependency graph and evaluate fields in correct order
export const evaluateFormulaFields = (
  fields: ChallanTemplateField[],
  customFields: Record<string, ICustomField>,
): Record<string, ICustomField> => {
  // Extract all field IDs
  const allFieldIds = fields.map((field) => field.id);

  // Step 1: Build dependency graph
  const dependencyGraph: Record<string, string[]> = {};

  // Initialize fields with no formula
  const fieldsWithFormulas: ChallanTemplateField[] = [];

  fields.forEach((field) => {
    // Extract dependencies from formula
    const dependencies = field.formula
      ? extractDependenciesFromFormula(field.formula, allFieldIds)
      : [];

    // Initialize each field in the dependency graph
    dependencyGraph[field.id] = dependencies;

    // Keep track of fields with formulas
    if (field.formula) {
      fieldsWithFormulas.push(field);
    }
  });

  // Step 2: Topological sort to get evaluation order
  const evaluated = new Set<string>();
  const evaluationOrder: string[] = [];

  // Helper function for topological sort
  const visit = (fieldId: string, ancestors: Set<string> = new Set()): void => {
    // Skip if already evaluated
    if (evaluated.has(fieldId)) return;

    // Check for circular dependencies
    if (ancestors.has(fieldId)) {
      console.error(`Circular dependency detected involving field: ${fieldId}`);
      return;
    }

    // Add to ancestors for cycle detection
    ancestors.add(fieldId);

    // Visit all dependencies first
    const dependencies = dependencyGraph[fieldId] || [];
    for (const depId of dependencies) {
      visit(depId, new Set(ancestors));
    }

    // Mark as evaluated and add to order
    evaluated.add(fieldId);
    evaluationOrder.push(fieldId);
  };

  // Visit each field with formula
  fieldsWithFormulas.forEach((field) => {
    if (!evaluated.has(field.id)) {
      visit(field.id);
    }
  });

  // Step 3: Evaluate formulas in the correct order
  const resultFields = { ...customFields };

  // Ensure all fields have a value (default to 0 for numeric fields)
  fields.forEach((field) => {
    if (field.type === FieldType.NUMBER && !resultFields[field.id]) {
      resultFields[field.id] = { value: '0' };
    }
  });

  // Evaluate in topological order
  for (const fieldId of evaluationOrder) {
    const field = fields.find((f) => f.id === fieldId);
    if (field && field.formula) {
      resultFields[fieldId].value = evaluateFormula(
        field.formula,
        resultFields,
      );
    }
  }

  return resultFields;
};
