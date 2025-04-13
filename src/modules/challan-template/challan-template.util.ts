import { ChallanTemplate, UserRole } from '@prisma/client';

/**
 * Filters the fieldSchema of a challan template based on user role
 * @param template The challan template to filter
 * @param userRole The role of the user accessing the template
 * @returns A new challan template with filtered fieldSchema based on user role
 */
export function filterTemplateFieldsByRole(
  template: ChallanTemplate & { fieldSchema: any[] },
  userRole: UserRole,
): ChallanTemplate & { fieldSchema: any[] } {
  // Return early if no template or fieldSchema
  if (!template || !template.fieldSchema) {
    return template;
  }

  // Create a new template object to avoid mutating the original
  const filteredTemplate = {
    ...template,
    fieldSchema: template.fieldSchema.filter((field) =>
      field.allowedRoles.includes(userRole),
    ),
  };

  return filteredTemplate;
}
