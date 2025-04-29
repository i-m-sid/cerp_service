import { LedgerAccountType } from '@prisma/client';

export interface DefaultLedgerCategory {
  id: string;
  name: string;
  code: string;
  accountType: LedgerAccountType;
  description: string;
  isDefault?: boolean;
}

// This ID will be used to store system-wide default categories
export const DEFAULT_ORGANIZATION_ID = 'cma2arh3200003b5yg9dieuh3';

export const defaultLedgerCategories: DefaultLedgerCategory[] = [
  /* ---------- ASSETS ---------- */
  {
    id: 'cma2bxe6u000f3b5yl5ncq001',
    name: 'Bank Accounts',
    code: '1000',
    accountType: LedgerAccountType.ASSET,
    description: 'Current, savings, CC accounts that hold cash balances',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq002',
    name: 'Cash-in-Hand',
    code: '1010',
    accountType: LedgerAccountType.ASSET,
    description: 'Physical cash, petty-cash tills',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq003',
    name: 'Deposits (Asset)',
    code: '1020',
    accountType: LedgerAccountType.ASSET,
    description: 'Security deposits, rent deposits, electricity deposits',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq004',
    name: 'Loans & Advances (Asset)',
    code: '1030',
    accountType: LedgerAccountType.ASSET,
    description: 'Advances to suppliers, staff loans, director loans (asset)',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq005',
    name: 'Current Assets',
    code: '1100',
    accountType: LedgerAccountType.ASSET,
    description: "Other short-term assets that don't fit specific groups",
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq006',
    name: 'Sundry Debtors',
    code: '1200',
    accountType: LedgerAccountType.ASSET,
    description: 'Amounts customers owe (trade receivables)',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq007',
    name: 'Stock-in-Hand',
    code: '1300',
    accountType: LedgerAccountType.ASSET,
    description: 'Raw material, work-in-progress, finished goods',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq008',
    name: 'Fixed Assets',
    code: '1400',
    accountType: LedgerAccountType.ASSET,
    description: 'Land, building, plant & machinery, furniture, computers',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq009',
    name: 'Investments',
    code: '1500',
    accountType: LedgerAccountType.ASSET,
    description: 'FDs, mutual funds, bonds and other investments',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq010',
    name: 'Duties & Taxes – Asset side',
    code: '1600',
    accountType: LedgerAccountType.ASSET,
    description: 'GST Input, TDS receivable, other recoverable taxes',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq011',
    name: 'Suspense / Miscellaneous Expenses (Asset)',
    code: '1700',
    accountType: LedgerAccountType.ASSET,
    description: 'Catch-all for opening-balance differences (should clear)',
    isDefault: true,
  },

  /* ---------- LIABILITIES & EQUITY ---------- */
  {
    id: 'cma2bxe6u000f3b5yl5ncq101',
    name: 'Capital Account',
    code: '2000',
    accountType: LedgerAccountType.EQUITY,
    description: 'Partner capital, proprietor capital, share capital',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq102',
    name: 'Reserves & Surplus',
    code: '2100',
    accountType: LedgerAccountType.EQUITY,
    description: 'Retained earnings, general reserve, P&L balance',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq103',
    name: 'Loans (Liability)',
    code: '2200',
    accountType: LedgerAccountType.LIABILITY,
    description: 'Term loans, unsecured loans, director loans',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq105',
    name: 'Current Liabilities',
    code: '2300',
    accountType: LedgerAccountType.LIABILITY,
    description: 'Accrued expenses, audit fee payable, advances from customers',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq106',
    name: 'Sundry Creditors',
    code: '2310',
    accountType: LedgerAccountType.LIABILITY,
    description: 'Trade payables to suppliers and service providers',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq107',
    name: 'Duties & Taxes – Liability side',
    code: '2400',
    accountType: LedgerAccountType.LIABILITY,
    description: 'GST Output, TDS payable, other statutory dues',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq108',
    name: 'Provisions',
    code: '2500',
    accountType: LedgerAccountType.LIABILITY,
    description: 'Provision for bonus, gratuity, income-tax, warranty, etc.',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq109',
    name: 'Bank O/D / OCC Accounts',
    code: '2600',
    accountType: LedgerAccountType.LIABILITY,
    description:
      'Bank overdraft, cash-credit limits (negative-balance bank a/cs)',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq110',
    name: 'Payroll Payables',
    code: '2700',
    accountType: LedgerAccountType.LIABILITY,
    description: 'Net salaries, PF, ESI, TDS on salary payable',
    isDefault: true,
  },

  /* ---------- REVENUE ---------- */
  {
    id: 'cma2bxe6u000f3b5yl5ncq201',
    name: 'Sales Accounts',
    code: '4000',
    accountType: LedgerAccountType.REVENUE,
    description: 'Domestic and export sales of goods / services',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq202',
    name: 'Direct Income',
    code: '4100',
    accountType: LedgerAccountType.REVENUE,
    description: 'Job-work charges, labour income, subcontracting receipts',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq203',
    name: 'Indirect Income',
    code: '4200',
    accountType: LedgerAccountType.REVENUE,
    description: 'Discount received, interest income, miscellaneous receipts',
    isDefault: true,
  },

  /* ---------- EXPENSES ---------- */
  {
    id: 'cma2bxe6u000f3b5yl5ncq301',
    name: 'Purchase Accounts',
    code: '5000',
    accountType: LedgerAccountType.EXPENSE,
    description:
      'Cost of goods or raw materials purchased for resale/production',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq302',
    name: 'Direct Expenses',
    code: '5100',
    accountType: LedgerAccountType.EXPENSE,
    description:
      'Factory wages, freight inward, power & fuel (production costs)',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq303',
    name: 'Indirect Expenses',
    code: '5200',
    accountType: LedgerAccountType.EXPENSE,
    description: 'Rent, telephone, repair & maintenance, office admin',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq304',
    name: 'Payroll Expenses',
    code: '5300',
    accountType: LedgerAccountType.EXPENSE,
    description: 'Salaries & wages, employer PF / ESIC, staff welfare',
    isDefault: true,
  },
  {
    id: 'cma2bxe6u000f3b5yl5ncq305',
    name: 'Duties & Taxes – Expense',
    code: '5500',
    accountType: LedgerAccountType.EXPENSE,
    description: 'GST paid under RCM or other non-creditable taxes',
    isDefault: true,
  },
];
