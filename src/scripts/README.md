# System Scripts

This directory contains utility scripts for system administration and setup.

## Available Scripts

### Initialize Default Ledger Categories

The `init-default-ledger-categories.ts` script sets up system-wide default ledger account categories that all organizations can use. This approach eliminates the need to create duplicate categories for each organization.

**Usage:**

```bash
npm run init:ledger-categories
```

This script should be run:

- During initial system setup
- After deployment to a new environment
- Any time you want to reset the default categories

If the default categories already exist, the script will detect this and not create duplicates.

## System-Wide vs. Organization-Specific Categories

The system now supports two types of ledger account categories:

1. **System-wide default categories:** These are shared by all organizations and cannot be modified by regular users.
2. **Organization-specific categories:** Each organization can create their own custom categories as needed.

When retrieving categories, the system will automatically combine both system-wide defaults and organization-specific categories.
