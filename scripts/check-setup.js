#!/usr/bin/env node

/**
 * Setup verification script
 * Checks if all required dependencies and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking project setup...\n');

let errors = [];
let warnings = [];

// Check .env file
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  errors.push('❌ .env file not found. Copy .env.example to .env and configure it.');
} else {
  console.log('✅ .env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('DATABASE_URL')) {
    errors.push('❌ DATABASE_URL not found in .env file');
  } else {
    console.log('✅ DATABASE_URL configured');
    if (!envContent.includes('sslmode=require')) {
      warnings.push('⚠️  DATABASE_URL should include ?sslmode=require');
    }
  }
  
  if (!envContent.includes('OPENAI_API_KEY')) {
    errors.push('❌ OPENAI_API_KEY not found in .env file');
  } else {
    console.log('✅ OPENAI_API_KEY configured');
  }
}

// Check Prisma schema
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  errors.push('❌ prisma/schema.prisma not found');
} else {
  console.log('✅ Prisma schema exists');
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (!schemaContent.includes('model PublishedImage')) {
    errors.push('❌ PublishedImage model not found in schema');
  } else {
    console.log('✅ PublishedImage model exists');
  }
}

// Check Prisma Client
const prismaClientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  warnings.push('⚠️  Prisma Client not generated. Run: npx prisma generate');
} else {
  console.log('✅ Prisma Client exists');
}

// Check required files
const requiredFiles = [
  'lib/prisma.js',
  'app/api/generate/route.js',
  'app/api/publish/route.js',
  'app/api/feed/route.js',
  'vitest.config.js',
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    errors.push(`❌ ${file} not found`);
  } else {
    console.log(`✅ ${file} exists`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Project is ready to run.');
  console.log('\nNext steps:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma migrate dev --name init');
  console.log('3. Run: pnpm dev');
  process.exit(0);
} else {
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(`  ${w}`));
  }
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(e => console.log(`  ${e}`));
    process.exit(1);
  }
}
