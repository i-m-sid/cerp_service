# Step 1: Compile TypeScript

npm run build

# Step 2: Install production dependencies

npm install --only=prod

# Step 3: Create ZIP file (excluding unnecessary files)

zip -r treaps-ondc-service-lambda.zip node_modules dist package.json .env
