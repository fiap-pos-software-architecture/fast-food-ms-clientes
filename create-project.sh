#!/bin/bash

# Create src directory and its subdirectories
mkdir -p src/{domain/{entities,ports},application/use-cases,infrastructure/{database/mongodb/models,adapters/controllers}}

# Create test directory
mkdir -p tests/unit

# Create domain layer files
touch src/domain/entities/customer.ts
touch src/domain/ports/customer-repository.ts

# Create application layer files
touch src/application/use-cases/{create-customer,get-customer,update-customer,delete-customer}.ts

# Create infrastructure layer files
touch src/infrastructure/database/mongodb/models/customer-model.ts
touch src/infrastructure/database/mongodb/mongodb-customer-repository.ts
touch src/infrastructure/adapters/controllers/customer-controller.ts

# Create main application file
touch src/main.ts

# Create test files
touch tests/unit/{create-customer,get-customer,update-customer,delete-customer}.test.ts

# Create package.json
npm init -y

# Create tsconfig.json
echo '{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}' > tsconfig.json

# Create .gitignore
echo 'node_modules
dist
.env' > .gitignore

# Install dependencies
npm install typescript @types/node ts-node-dev mongoose express @types/express
npm install --save-dev jest @types/jest ts-jest

# Update package.json scripts
npm pkg set scripts.start="ts-node-dev src/main.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.test="jest"

echo "Customer service project structure created successfully!"
