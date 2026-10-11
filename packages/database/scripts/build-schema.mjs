import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const schemaDir = path.join(root, 'schema');
const outputPath = path.join(root, 'prisma', 'schema.prisma');
const files = [
  'identity.prisma',
  'school.prisma',
  'academic.prisma',
  'student.prisma',
  'teacher.prisma',
  'exam.prisma',
  'document.prisma',
  'notice.prisma',
  'file.prisma',
  'ai.prisma',
  'system.prisma',
];

const header = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

const sections = [];
for (const file of files) {
  const content = await readFile(path.join(schemaDir, file), 'utf8');
  sections.push(`// ${file}\n${content.trim()}\n`);
}

await writeFile(outputPath, `${header}\n${sections.join('\n')}`);
