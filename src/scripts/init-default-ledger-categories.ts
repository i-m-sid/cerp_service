import { PrismaClient } from '@prisma/client';
import {
  DEFAULT_ORGANIZATION_ID,
  defaultLedgerCategories,
} from '../modules/ledger/ledger.categories.default';

/**
 * This script initializes system-wide default ledger categories
 * It should be run once during system setup or deployment
 */
async function initializeDefaultLedgerCategories() {
  const prisma = new PrismaClient();

  try {
    console.log('Checking if system default organization exists...');

    // First check if the DEFAULT_ORGANIZATION_ID exists
    let defaultOrg = await prisma.organization.findUnique({
      where: { id: DEFAULT_ORGANIZATION_ID },
    });

    // Create the default organization if it doesn't exist
    if (!defaultOrg) {
      console.log('Creating system default organization...');
      defaultOrg = await prisma.organization.create({
        data: {
          id: DEFAULT_ORGANIZATION_ID,
          orgName: 'System Default',
          legalName: 'System Default',
        },
      });
    }

    console.log('Processing default ledger categories...');

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each default category
    for (const category of defaultLedgerCategories) {
      // Check if the category already exists by ID
      const existingCategory = await prisma.ledgerAccountCategory.findUnique({
        where: {
          id: category.id,
        },
      });

      if (existingCategory) {
        // Category exists, check if it needs updating
        const needsUpdate =
          existingCategory.name !== category.name ||
          existingCategory.code !== category.code ||
          existingCategory.isDefault !== category.isDefault ||
          existingCategory.description !== category.description ||
          existingCategory.accountType !== category.accountType;

        if (needsUpdate) {
          // Update the existing category
          await prisma.ledgerAccountCategory.update({
            where: { id: category.id },
            data: {
              name: category.name,
              code: category.code,
              isDefault: true,
              description: category.description,
              accountType: category.accountType,
              // Always ensure it's linked to the default org
              orgId: DEFAULT_ORGANIZATION_ID,
            },
          });
          console.log(`Updated category: ${category.name} (${category.id})`);
          updatedCount++;
        } else {
          console.log(
            `Skipped unchanged category: ${category.name} (${category.id})`,
          );
          skippedCount++;
        }
      } else {
        // Category does not exist, create it
        await prisma.ledgerAccountCategory.create({
          data: {
            id: category.id,
            name: category.name,
            code: category.code,
            description: category.description,
            accountType: category.accountType,
            isDefault: true,
            orgId: DEFAULT_ORGANIZATION_ID,
          },
        });
        console.log(`Created category: ${category.name} (${category.id})`);
        createdCount++;
      }
    }

    console.log('System default ledger categories processing complete:');
    console.log(`- Created: ${createdCount}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`- Total processed: ${defaultLedgerCategories.length}`);
  } catch (error) {
    console.error('Error initializing default ledger categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
initializeDefaultLedgerCategories().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
