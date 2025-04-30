import {
  ICreateInvoice,
  ICreateLineItem,
  ILineItemChallan,
  IUpdateInvoice,
  IBulkUpdateInvoices,
  IUpdateLineItem,
  ILineItem,
} from './invoice.interface';
import { InvoiceRepository } from './invoice.repository';
import {
  ChallanTemplate,
  InvoiceType,
  JournalStatus,
  LedgerAccount,
  Party,
  PrismaClient,
  TransactionType,
  VoucherType,
  SourceType,
  Prisma,
} from '@prisma/client';
import { ChallanService } from '../challan/challan.service';
import { OrganizationService } from '../organization/organization.service';
import { ChallanTemplateService } from '../challan-template/challan-template.service';
import {
  getInvoiceNumericPart,
  getInvoiceConfigCurrentNumber,
  updateInvoiceConfigCurrentNumber,
} from './invoice.utils';
import { IChallan, IUpdateChallan } from '../challan/challan.interface';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerConstants } from '../ledger/ledger.constants';
import { JournalService } from '../journal/journal.service';
import { ICreateJournalLine } from '../journal/journal.interface';
import { Invoice } from '@prisma/client';
export class InvoiceService {
  private repository: InvoiceRepository;
  private prisma: PrismaClient;
  private challanTemplateService: ChallanTemplateService;
  private challanService: ChallanService;
  private ledgerService: LedgerService;
  private journalService: JournalService;
  private organizationService: OrganizationService;
  constructor() {
    this.repository = new InvoiceRepository();
    this.prisma = new PrismaClient();
    this.challanTemplateService = new ChallanTemplateService();
    this.challanService = new ChallanService();
    this.organizationService = new OrganizationService();
    this.ledgerService = new LedgerService();
    this.journalService = new JournalService();
  }

  async create(data: ICreateInvoice, userId: string) {
    try {
      await this.updateChallansByLineItems(
        data.challanTemplateId,
        data.orgId,
        data.invoiceType ?? InvoiceType.INVOICE,
        data.lineItems,
      );
      const invoice = await this.repository.create(data);
      await this.updateInvoiceConfig(
        invoice.invoiceNumber,
        invoice.invoiceType,
        invoice.orgId,
        userId,
      );
      await this.createOrUpdateInvoiceJournal(
        invoice as unknown as Invoice & { party: Party } & {
          challanTemplate: ChallanTemplate;
        },
      );
      return invoice;
    } catch (error) {
      // Rethrow the error to be handled by the controller
      throw error;
    }
  }

  async findAll(
    orgId: string,
    transactionType?: TransactionType,
    invoiceType?: InvoiceType,
    startDate?: Date,
    endDate?: Date,
    partyId?: string,
  ) {
    return this.repository.findAll(
      orgId,
      transactionType,
      invoiceType,
      startDate,
      endDate,
      partyId,
    );
  }

  async findById(id: string, orgId: string) {
    return this.repository.findById(id, orgId);
  }

  async findByIds(ids: string[], orgId: string) {
    return this.repository.findByIds(ids, orgId);
  }

  async findByPartyId(partyId: string, orgId: string) {
    return this.repository.findByPartyId(partyId, orgId);
  }

  async update(data: IUpdateInvoice, userId: string) {
    await this.updateChallansByLineItems(
      data.challanTemplateId ?? '',
      data.orgId,
      data.invoiceType ?? InvoiceType.INVOICE,
      data.lineItems ?? [],
    );
    const invoice = await this.repository.update(data);
    await this.updateInvoiceConfig(
      invoice.invoiceNumber,
      invoice.invoiceType,
      invoice.orgId,
      userId,
    );
    await this.createOrUpdateInvoiceJournal(
      invoice as unknown as Invoice & { party: Party } & {
        challanTemplate: ChallanTemplate;
      },
    );
    return invoice;
  }

  async delete(id: string, orgId: string) {
    const invoice = await this.repository.findById(id, orgId);
    if (invoice?.challans) {
      await this.resetChallanStatus(
        invoice.challanTemplateId,
        orgId,
        invoice.challans.map((challan) => challan.id),
      );
    }
    if (
      invoice?.invoiceType == InvoiceType.INVOICE ||
      invoice?.invoiceType == InvoiceType.PRO_FORMA
    ) {
      await this.deleteInvoiceJournal(id, orgId);
    }
    return this.repository.delete(id, orgId);
  }
  async findByTransactionType(transactionType: TransactionType, orgId: string) {
    return this.repository.findByTransactionType(transactionType, orgId);
  }

  async findByInvoiceType(invoiceType: InvoiceType, orgId: string) {
    return this.repository.findByInvoiceType(invoiceType, orgId);
  }

  async findByTypes(
    orgId: string,
    transactionType?: TransactionType,
    invoiceType?: InvoiceType,
  ) {
    return this.repository.findByTypes(orgId, transactionType, invoiceType);
  }

  async bulkDelete(ids: string[], orgId: string) {
    for (const id of ids) {
      const invoice = await this.repository.findById(id, orgId);
      if (invoice?.challans) {
        await this.resetChallanStatus(
          invoice.challanTemplateId,
          orgId,
          invoice.challans.map((challan) => challan.id),
        );
      }
      await this.deleteInvoiceJournal(id, orgId);
    }
    return this.repository.bulkDelete(ids, orgId);
  }

  async resetChallanStatus(
    challanTemplateId: string,
    orgId: string,
    challanIds: string[],
  ) {
    const challans = await this.challanService.findManyByIds(challanIds, orgId);
    const org = await this.organizationService.findById(orgId);
    const statusId = org?.config?.challanDefaultStatus?.[challanTemplateId];
    for (const challan of challans) {
      if (statusId) {
        challan.statusId = statusId;
      }
    }
    if (challans.length > 0) {
      await this.challanService.bulkUpdate(
        {
          challans: challans as IUpdateChallan[],
        },
        orgId,
      );
    }
  }

  async updateInvoiceConfig(
    invoiceNumber: string,
    invoiceType: InvoiceType,
    orgId: string,
    userId: string,
  ) {
    try {
      const org = await this.organizationService.findById(orgId);
      if (org?.config) {
        const documentNumber = getInvoiceNumericPart(
          invoiceNumber,
          invoiceType,
          org?.config,
        );
        if (documentNumber) {
          const currentNumber = getInvoiceConfigCurrentNumber(
            invoiceType,
            org?.config,
          );
          const updatedConfig = updateInvoiceConfigCurrentNumber(
            invoiceType,
            Math.max(
              parseInt(currentNumber),
              parseInt(documentNumber),
            ).toString(),
            org?.config!,
          );
          await this.organizationService.update(
            { id: orgId, config: updatedConfig },
            userId,
          );
        }
      }
    } catch (error) {
      console.error('Error updating invoice config:', error);
    }
  }

  async updateChallansByLineItems(
    challanTemplateId: string,
    orgId: string,
    invoiceType: InvoiceType,
    lineItems: ICreateLineItem[] | IUpdateLineItem[],
  ) {
    try {
      const challanTemplate = await this.challanTemplateService.findById(
        challanTemplateId,
        orgId,
      );
      const org = await this.organizationService.findById(orgId);
      const statusId =
        org?.config?.invoiceTypeToChallanStatus?.[challanTemplateId]?.[
          invoiceType
        ];
      const fieldSchema = challanTemplate?.fieldSchema;
      if (fieldSchema) {
        const rateField = fieldSchema!.find(
          (field) => field.invoiceField === 'rate',
        );
        const gstRateField = fieldSchema!.find(
          (field) => field.invoiceField === 'gst',
        );
        const cgstRateField = fieldSchema!.find(
          (field) => field.invoiceField === 'cgst',
        );
        const sgstRateField = fieldSchema!.find(
          (field) => field.invoiceField === 'sgst',
        );
        const igstRateField = fieldSchema!.find(
          (field) => field.invoiceField === 'igst',
        );
        const cessAdValoremField = fieldSchema!.find(
          (field) => field.invoiceField === 'cessAdValorem',
        );
        const cessSpecificField = fieldSchema!.find(
          (field) => field.invoiceField === 'cessSpecific',
        );
        const stateCessAdValoremField = fieldSchema!.find(
          (field) => field.invoiceField === 'stateCessAdValorem',
        );
        const stateCessSpecificField = fieldSchema!.find(
          (field) => field.invoiceField === 'stateCessSpecific',
        );
        const fixedDiscountField = fieldSchema!.find(
          (field) => field.invoiceField === 'fixedDiscount',
        );
        const percentageDiscountField = fieldSchema!.find(
          (field) => field.invoiceField === 'percentageDiscount',
        );

        const lineItemChallans: ILineItemChallan[] = [];
        const allChallansToUpdate: IUpdateChallan[] = [];

        for (const lineItem of lineItems) {
          const challanIds = lineItem.challanIds ?? [];
          const challans = await this.challanService.findManyByIds(
            challanIds,
            orgId,
          );
          lineItemChallans.push({
            rate: lineItem.rate,
            quantity: lineItem.quantity,
            gstRate: lineItem.gstRate,
            cessAdValoremRate: lineItem.cessAdValoremRate,
            cessSpecificRate: lineItem.cessSpecificRate,
            stateCessAdValoremRate: lineItem.stateCessAdValoremRate,
            stateCessSpecificRate: lineItem.stateCessSpecificRate,
            fixedDiscount: lineItem.fixedDiscount,
            percentageDiscount: lineItem.percentageDiscount,
            challans: challans.map((challan) => ({
              ...challan,
              statusId:
                challan.statusId === null ? undefined : challan.statusId,
            })) as IChallan[],
          });
        }

        for (const lineItemChallan of lineItemChallans) {
          for (const challan of lineItemChallan.challans) {
            if (challan && challan.customFields) {
              if (
                invoiceType == InvoiceType.INVOICE ||
                invoiceType == InvoiceType.PRO_FORMA
              ) {
                if (statusId) {
                  challan.statusId = statusId;
                }
              }

              if (rateField && lineItemChallan.rate) {
                challan.customFields[rateField!.id] = {
                  ...challan.customFields[rateField!.id],
                  value: lineItemChallan.rate.toString(),
                };
              }
              if (gstRateField && lineItemChallan.gstRate) {
                challan.customFields[gstRateField!.id] = {
                  ...challan.customFields[gstRateField!.id],
                  value: (lineItemChallan.gstRate / 2).toString(),
                };
              }
              if (cgstRateField && lineItemChallan.gstRate) {
                challan.customFields[cgstRateField!.id] = {
                  ...challan.customFields[cgstRateField!.id],
                  value: (!lineItemChallan.isInterState
                    ? lineItemChallan.gstRate / 2
                    : 0
                  ).toString(),
                };
              }
              if (sgstRateField && lineItemChallan.gstRate) {
                challan.customFields[sgstRateField!.id] = {
                  ...challan.customFields[sgstRateField!.id],
                  value: (!lineItemChallan.isInterState
                    ? lineItemChallan.gstRate / 2
                    : 0
                  ).toString(),
                };
              }
              if (igstRateField && lineItemChallan.gstRate) {
                challan.customFields[igstRateField!.id] = {
                  ...challan.customFields[igstRateField!.id],
                  value: (lineItemChallan.isInterState
                    ? lineItemChallan.gstRate
                    : 0
                  ).toString(),
                };
              }
              if (cessAdValoremField && lineItemChallan.cessAdValoremRate) {
                challan.customFields[cessAdValoremField!.id] = {
                  ...challan.customFields[cessAdValoremField!.id],
                  value: lineItemChallan.cessAdValoremRate.toString(),
                };
              }
              if (cessSpecificField && lineItemChallan.cessSpecificRate) {
                challan.customFields[cessSpecificField!.id] = {
                  ...challan.customFields[cessSpecificField!.id],
                  value: lineItemChallan.cessSpecificRate.toString(),
                };
              }
              if (
                stateCessAdValoremField &&
                lineItemChallan.stateCessAdValoremRate
              ) {
                challan.customFields[stateCessAdValoremField!.id] = {
                  ...challan.customFields[stateCessAdValoremField!.id],
                  value: lineItemChallan.stateCessAdValoremRate.toString(),
                };
              }
              if (
                stateCessSpecificField &&
                lineItemChallan.stateCessSpecificRate
              ) {
                challan.customFields[stateCessSpecificField!.id] = {
                  ...challan.customFields[stateCessSpecificField!.id],
                  value: lineItemChallan.stateCessSpecificRate.toString(),
                };
              }
              if (fixedDiscountField && lineItemChallan.fixedDiscount) {
                challan.customFields[fixedDiscountField!.id] = {
                  ...challan.customFields[fixedDiscountField!.id],
                  value: lineItemChallan.fixedDiscount.toString(),
                };
              }
              if (
                percentageDiscountField &&
                lineItemChallan.percentageDiscount
              ) {
                challan.customFields[percentageDiscountField!.id] = {
                  ...challan.customFields[percentageDiscountField!.id],
                  value: lineItemChallan.percentageDiscount.toString(),
                };
              }
            }

            // Add the updated challan to the collection for bulk update
            allChallansToUpdate.push(challan as IUpdateChallan);
          }
        }

        // Perform a single bulk update with all challans
        if (allChallansToUpdate.length > 0) {
          await this.challanService.bulkUpdate(
            {
              challans: allChallansToUpdate,
            },
            orgId,
          );
        }
      }
    } catch (error) {
      console.error('Error updating challans by line items:', error);
      throw new Error('Error updating challans');
    }
  }

  async deleteInvoiceJournal(invoiceId: string, orgId: string) {
    const journal = await this.journalService.findBySourceTypeAndSourceId(
      SourceType.INVOICE,
      invoiceId,
      orgId,
    );
    if (journal) {
      await this.journalService.delete(journal.id);
    }
  }

  async createOrUpdateInvoiceJournal(
    invoice: Invoice & { party: Party } & {
      challanTemplate: ChallanTemplate;
    },
  ) {
    if (
      invoice.invoiceType !== InvoiceType.INVOICE &&
      invoice.invoiceType !== InvoiceType.PRO_FORMA
    ) {
      return;
    }
    const existingJournal =
      await this.journalService.findBySourceTypeAndSourceId(
        SourceType.INVOICE,
        invoice.id,
        invoice.orgId,
      );
    // Get or create the necessary ledger accounts
    const partyLedgerAccount = await this.getOrCreatePartyLedgerAccount(
      invoice.party,
      invoice.transactionType,
      invoice.orgId,
    );
    const transactionLedgerAccount =
      await this.getOrCreateTransactionLedgerAccount(
        invoice.challanTemplate.name,
        invoice.transactionType,
        invoice.orgId,
      );
    const roundOffLedgerAccount = await this.getRoundOffLedgerAccount(
      invoice.orgId,
    );

    // Calculate total amounts for different tax types
    const totalTaxableAmount = Number(invoice.subTotal ?? 0);
    const totalAmount = Number(invoice.totalAmount ?? 0);
    const roundOff = Number(invoice.roundOffAmount ?? 0);

    // Initialize maps to store tax amounts by rates
    const cgstAmountsByRate = new Map<number, number>();
    const sgstAmountsByRate = new Map<number, number>();
    const igstAmountsByRate = new Map<number, number>();
    const cessAdValoremAmountsByRate = new Map<number, number>();
    const stateCessAdValoremAmountsByRate = new Map<number, number>();
    let totalCessSpecific = 0;
    let totalStateCessSpecific = 0;

    // Process line items to segregate tax amounts by rates
    const lineItems = invoice.lineItems as unknown as ILineItem[];
    if (lineItems && lineItems.length > 0) {
      for (const lineItem of lineItems) {
        const taxableAmount =
          Number(lineItem.rate ?? 0) * Number(lineItem.quantity ?? 0);

        // Handle CGST
        if (!lineItem.isInterState && lineItem.gstRate) {
          const cgstRate = lineItem.gstRate / 2;
          const cgstAmount = (taxableAmount * cgstRate) / 100;
          cgstAmountsByRate.set(
            cgstRate,
            (cgstAmountsByRate.get(cgstRate) ?? 0) + cgstAmount,
          );
        }

        // Handle SGST
        if (!lineItem.isInterState && lineItem.gstRate) {
          const sgstRate = lineItem.gstRate / 2;
          const sgstAmount = (taxableAmount * sgstRate) / 100;
          sgstAmountsByRate.set(
            sgstRate,
            (sgstAmountsByRate.get(sgstRate) ?? 0) + sgstAmount,
          );
        }

        // Handle IGST
        if (lineItem.isInterState && lineItem.gstRate) {
          const igstRate = lineItem.gstRate;
          const igstAmount = (taxableAmount * igstRate) / 100;
          igstAmountsByRate.set(
            igstRate,
            (igstAmountsByRate.get(igstRate) ?? 0) + igstAmount,
          );
        }

        // Handle Cess Ad Valorem
        if (lineItem.cessAdValoremRate) {
          const cessAmount = (taxableAmount * lineItem.cessAdValoremRate) / 100;
          cessAdValoremAmountsByRate.set(
            lineItem.cessAdValoremRate,
            (cessAdValoremAmountsByRate.get(lineItem.cessAdValoremRate) ?? 0) +
              cessAmount,
          );
        }

        // Handle State Cess Ad Valorem
        if (lineItem.stateCessAdValoremRate) {
          const stateCessAmount =
            (taxableAmount * lineItem.stateCessAdValoremRate) / 100;
          stateCessAdValoremAmountsByRate.set(
            lineItem.stateCessAdValoremRate,
            (stateCessAdValoremAmountsByRate.get(
              lineItem.stateCessAdValoremRate,
            ) ?? 0) + stateCessAmount,
          );
        }

        // Handle Specific Cess amounts
        if (lineItem.cessSpecificRate) {
          totalCessSpecific +=
            Number(lineItem.quantity ?? 0) * lineItem.cessSpecificRate;
        }

        // Handle State Specific Cess amounts
        if (lineItem.stateCessSpecificRate) {
          totalStateCessSpecific +=
            Number(lineItem.quantity ?? 0) * lineItem.stateCessSpecificRate;
        }
      }
    }

    // Get tax ledger accounts for each tax type and rate if applicable
    const journalLines: ICreateJournalLine[] = [];

    // Process CGST by rates
    for (const [rate, amount] of cgstAmountsByRate.entries()) {
      if (amount > 0) {
        const cgstAccount = await this.getOrCreateTaxLedgerAccount(
          invoice.transactionType,
          invoice.orgId,
          'CGST',
          rate,
        );
        journalLines.push({
          accountId: cgstAccount.id,
          description: `CGST @${rate}%`,
          debitAmount:
            invoice.transactionType === TransactionType.PURCHASE
              ? amount
              : undefined,
          creditAmount:
            invoice.transactionType === TransactionType.SALES
              ? amount
              : undefined,
        });
      }
    }

    // Process SGST by rates
    for (const [rate, amount] of sgstAmountsByRate.entries()) {
      if (amount > 0) {
        const sgstAccount = await this.getOrCreateTaxLedgerAccount(
          invoice.transactionType,
          invoice.orgId,
          'SGST',
          rate,
        );
        journalLines.push({
          accountId: sgstAccount.id,
          description: `SGST @${rate}%`,
          debitAmount:
            invoice.transactionType === TransactionType.PURCHASE
              ? amount
              : undefined,
          creditAmount:
            invoice.transactionType === TransactionType.SALES
              ? amount
              : undefined,
        });
      }
    }

    // Process IGST by rates
    for (const [rate, amount] of igstAmountsByRate.entries()) {
      if (amount > 0) {
        const igstAccount = await this.getOrCreateTaxLedgerAccount(
          invoice.transactionType,
          invoice.orgId,
          'IGST',
          rate,
        );
        journalLines.push({
          accountId: igstAccount.id,
          description: `IGST @${rate}%`,
          debitAmount:
            invoice.transactionType === TransactionType.PURCHASE
              ? amount
              : undefined,
          creditAmount:
            invoice.transactionType === TransactionType.SALES
              ? amount
              : undefined,
        });
      }
    }

    // Process Cess Ad Valorem by rates
    for (const [rate, amount] of cessAdValoremAmountsByRate.entries()) {
      if (amount > 0) {
        const cessAccount = await this.getOrCreateTaxLedgerAccount(
          invoice.transactionType,
          invoice.orgId,
          'Cess Ad Valorem',
          rate,
        );
        journalLines.push({
          accountId: cessAccount.id,
          description: `Cess Ad Valorem @${rate}%`,
          debitAmount:
            invoice.transactionType === TransactionType.PURCHASE
              ? amount
              : undefined,
          creditAmount:
            invoice.transactionType === TransactionType.SALES
              ? amount
              : undefined,
        });
      }
    }

    // Process State Cess Ad Valorem by rates
    for (const [rate, amount] of stateCessAdValoremAmountsByRate.entries()) {
      if (amount > 0) {
        const stateCessAccount = await this.getOrCreateTaxLedgerAccount(
          invoice.transactionType,
          invoice.orgId,
          'State Cess Ad Valorem',
          rate,
        );
        journalLines.push({
          accountId: stateCessAccount.id,
          description: `State Cess Ad Valorem @${rate}%`,
          debitAmount:
            invoice.transactionType === TransactionType.PURCHASE
              ? amount
              : undefined,
          creditAmount:
            invoice.transactionType === TransactionType.SALES
              ? amount
              : undefined,
        });
      }
    }

    // Process Specific Cess (without rate)
    if (totalCessSpecific > 0) {
      const cessSpecificAccount = await this.getOrCreateTaxLedgerAccount(
        invoice.transactionType,
        invoice.orgId,
        'Cess Specific',
        0,
      );
      journalLines.push({
        accountId: cessSpecificAccount.id,
        description: `Cess Non Ad Valorem`,
        debitAmount:
          invoice.transactionType === TransactionType.PURCHASE
            ? totalCessSpecific
            : undefined,
        creditAmount:
          invoice.transactionType === TransactionType.SALES
            ? totalCessSpecific
            : undefined,
      });
    }

    // Process State Specific Cess (without rate)
    if (totalStateCessSpecific > 0) {
      const stateCessSpecificAccount = await this.getOrCreateTaxLedgerAccount(
        invoice.transactionType,
        invoice.orgId,
        'State Cess Specific',
        0,
      );
      journalLines.push({
        accountId: stateCessSpecificAccount.id,
        description: `State Cess Non Ad Valorem`,
        debitAmount:
          invoice.transactionType === TransactionType.PURCHASE
            ? totalStateCessSpecific
            : undefined,
        creditAmount:
          invoice.transactionType === TransactionType.SALES
            ? totalStateCessSpecific
            : undefined,
      });
    }

    // Handle round off amount
    if (roundOff !== 0) {
      journalLines.push({
        accountId: roundOffLedgerAccount.id,
        description: `Round off`,
        debitAmount:
          (invoice.transactionType === TransactionType.SALES && roundOff < 0) ||
          (invoice.transactionType === TransactionType.PURCHASE && roundOff > 0)
            ? Math.abs(roundOff)
            : undefined,
        creditAmount:
          (invoice.transactionType === TransactionType.SALES && roundOff > 0) ||
          (invoice.transactionType === TransactionType.PURCHASE && roundOff < 0)
            ? Math.abs(roundOff)
            : undefined,
      });
    }

    const journalDescription = `${invoice.challanTemplate.name} ${invoice.invoiceType.replace(/_/g, ' ').toLowerCase()} - ${invoice.invoiceNumber}`;

    // Create the appropriate journal entry based on transaction type
    if (invoice.transactionType === TransactionType.SALES) {
      // For Sales: Debit Party (Receivable), Credit Sales, Credit Tax Accounts
      journalLines.push(
        {
          accountId: partyLedgerAccount.id,
          description: `${invoice.invoiceNumber}`,
          debitAmount: totalAmount,
        },
        {
          accountId: transactionLedgerAccount.id,
          description: `${invoice.invoiceNumber}`,
          creditAmount: totalTaxableAmount,
        },
      );

      // Create the journal entry
      if (existingJournal) {
        await this.journalService.update({
          id: existingJournal.id,
          orgId: invoice.orgId,
          voucherNumber: invoice.invoiceNumber,
          voucherType: VoucherType.SALES,
          date: invoice.date,
          status: JournalStatus.POSTED,
          description: journalDescription,
          lines: journalLines,
          sourceType: SourceType.INVOICE,
          sourceId: invoice.id,
        });
      } else {
        await this.journalService.create({
          orgId: invoice.orgId,
          voucherNumber: invoice.invoiceNumber,
          voucherType: VoucherType.SALES,
          date: invoice.date,
          status: JournalStatus.POSTED,
          description: journalDescription,
          lines: journalLines,
          sourceType: SourceType.INVOICE,
          sourceId: invoice.id,
        });
      }
    } else if (invoice.transactionType === TransactionType.PURCHASE) {
      // For Purchase: Debit Purchase, Debit Tax Accounts, Credit Party (Payable)
      journalLines.push(
        {
          accountId: transactionLedgerAccount.id,
          description: `${invoice.invoiceNumber}`,
          debitAmount: totalTaxableAmount,
        },
        {
          accountId: partyLedgerAccount.id,
          description: `${invoice.invoiceNumber}`,
          creditAmount: totalAmount,
        },
      );

      if (existingJournal) {
        await this.journalService.update({
          id: existingJournal.id,
          orgId: invoice.orgId,
          voucherNumber: invoice.invoiceNumber,
          voucherType: VoucherType.PURCHASE,
          date: invoice.date,
          status: JournalStatus.POSTED,
          description: journalDescription,
          lines: journalLines,
          sourceType: SourceType.INVOICE,
          sourceId: invoice.id,
        });
      } else {
        await this.journalService.create({
          orgId: invoice.orgId,
          voucherNumber: invoice.invoiceNumber,
          voucherType: VoucherType.PURCHASE,
          date: invoice.date,
          status: JournalStatus.POSTED,
          description: journalDescription,
          lines: journalLines,
          sourceType: SourceType.INVOICE,
          sourceId: invoice.id,
        });
      }
    }
  }

  private async getRoundOffLedgerAccount(
    orgId: string,
  ): Promise<LedgerAccount> {
    const categoryId = LedgerConstants.indirectExpenseId;
    const ledgerAccount = await this.ledgerService.findByName(
      'Round Off',
      orgId,
    );
    if (ledgerAccount) {
      return ledgerAccount;
    }
    return this.ledgerService.createAccount({
      name: 'Round Off',
      categoryId,
      orgId,
      isSystemGenerated: true,
      isBank: false,
      isActive: true,
      description: 'Account for rounding off invoice amounts',
      openingBalance: 0,
    });
  }
  private async getOrCreateTransactionLedgerAccount(
    templateName: string,
    transactionType: TransactionType,
    orgId: string,
  ): Promise<LedgerAccount> {
    const suffix =
      transactionType === TransactionType.SALES ? 'Sale' : 'Purchase';
    const categoryId =
      transactionType === TransactionType.SALES
        ? LedgerConstants.salesId
        : LedgerConstants.purchaseId;
    const ledgerAccountName = `${templateName} ${suffix}`;
    const ledgerAccount = await this.ledgerService.findByName(
      ledgerAccountName,
      orgId,
    );
    if (ledgerAccount && ledgerAccount.categoryId === categoryId) {
      return ledgerAccount;
    }
    return this.ledgerService.createAccount({
      name: ledgerAccountName,
      categoryId,
      orgId,
      isSystemGenerated: true,
      isBank: false,
      isActive: true,
      description: `Account for ${templateName} transactions`,
      openingBalance: 0,
    });
  }

  private async getOrCreatePartyLedgerAccount(
    party: Party,
    transactionType: TransactionType,
    orgId: string,
  ): Promise<LedgerAccount> {
    const partyName = party.tradeName ?? party.legalName ?? '';
    const suffix =
      transactionType === TransactionType.SALES ? 'Receivable' : 'Payable';
    const ledgerAccountName = `${partyName} ${suffix}`;
    const partyLedgerAccount = await this.ledgerService.findByName(
      ledgerAccountName,
      orgId,
    );
    const categoryId =
      transactionType === TransactionType.SALES
        ? LedgerConstants.salesId
        : LedgerConstants.purchaseId;

    if (partyLedgerAccount && partyLedgerAccount.categoryId === categoryId) {
      return partyLedgerAccount;
    }
    return this.ledgerService.createAccount({
      name: ledgerAccountName,
      partyId: party.id,
      orgId,
      isSystemGenerated: true,
      categoryId: categoryId,
      isBank: false,
      isActive: true,
      description: `${transactionType === TransactionType.SALES ? 'Receivable from' : 'Payable to'} ${partyName}}`,
      openingBalance: Number(party.openingBalance ?? 0),
    });
  }

  private async getOrCreateTaxLedgerAccount(
    transactionType: TransactionType,
    orgId: string,
    taxName: string,
    taxRate: number,
  ): Promise<LedgerAccount> {
    const categoryId =
      transactionType === TransactionType.SALES
        ? LedgerConstants.taxOutputId
        : LedgerConstants.taxInputId;
    const direction =
      transactionType === TransactionType.SALES ? 'Output' : 'Input';
    const taxLedgerAccountName = `${taxName} ${direction} ${taxRate}%`;
    const taxLedgerAccount = await this.ledgerService.findByName(
      taxLedgerAccountName,
      orgId,
    );
    if (taxLedgerAccount && taxLedgerAccount.categoryId === categoryId) {
      return taxLedgerAccount;
    }
    return this.ledgerService.createAccount({
      name: taxLedgerAccountName,
      categoryId,
      orgId,
      isSystemGenerated: true,
      isBank: false,
      isActive: true,
      description: `Account for ${taxName} ${direction} at ${taxRate}% rate`,
      openingBalance: 0,
    });
  }
}
