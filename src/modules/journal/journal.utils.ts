import { IOrganizationConfig } from '../organization/organization.interface';

/**
 * Gets the current journal number from the organization config
 */
export function getJournalCurrentNumber(config?: IOrganizationConfig): string {
  if (!config?.journal?.currentNumber) {
    return '0';
  }
  return config.journal.currentNumber;
}

/**
 * Generates the next journal voucher number based on organization config
 */
export function generateJournalVoucherNumber(
  config?: IOrganizationConfig,
): string {
  if (!config?.journal) {
    return '1';
  }

  const { prefix = '', suffix = '', currentNumber = '0' } = config.journal;
  const nextNumber = (parseInt(currentNumber) + 1).toString();
  return `${prefix}${nextNumber}${suffix}`;
}

/**
 * Gets the numeric part of a journal voucher number
 */
export function getJournalNumericPart(
  voucherNumber: string,
  config?: IOrganizationConfig,
): string | null {
  if (!config?.journal) {
    return voucherNumber;
  }

  const { prefix = '', suffix = '' } = config.journal;

  // Remove prefix and suffix
  let number = voucherNumber;
  if (prefix && number.startsWith(prefix)) {
    number = number.substring(prefix.length);
  }
  if (suffix && number.endsWith(suffix)) {
    number = number.substring(0, number.length - suffix.length);
  }

  // Return null if the remaining part is not a number
  return /^\d+$/.test(number) ? number : null;
}

/**
 * Updates the current number in the organization config for journals
 */
export function updateJournalConfigCurrentNumber(
  currentNumber: string,
  organizationConfig?: IOrganizationConfig,
): IOrganizationConfig {
  if (!organizationConfig) {
    return {
      journal: {
        prefix: '',
        suffix: '',
        currentNumber,
      },
    };
  }

  return {
    ...organizationConfig,
    journal: organizationConfig.journal
      ? { ...organizationConfig.journal, currentNumber }
      : { prefix: '', suffix: '', currentNumber },
  };
}
