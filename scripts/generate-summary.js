const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { globSync } = require('glob');

const docsDir = path.join(__dirname, '../docs');
const outputFile = path.join(__dirname, '../docs/role-summary.mdx');

// Define categories to include, ordered for the table
const categories = [
  'village',
  'wolfpack',
  'coven',
  'undead',
  'vampires',
  'neutral',
  'bloodmoon-cult',
  'holiday-roles'
];

// Map folder names to display names
const categoryLabels = {
  'village': 'The Village',
  'wolfpack': 'The Wolfpack',
  'coven': 'The Coven',
  'undead': 'The Undead',
  'vampires': 'The Vampires',
  'neutral': 'Neutral Roles',
  'bloodmoon-cult': 'Bloodmoon Cult',
  'holiday-roles': 'Holiday Roles'
};

let sections = "";

categories.forEach(category => {
  const files = globSync(path.join(docsDir, category, '*.mdx').replace(/\\/g, '/'));
  
  if (files.length === 0) return;

  let table = `\n## ${categoryLabels[category]}\n\n`;
  table += `![${categoryLabels[category]} Card](@site/docs/assets/category-pngs/${category}.png)\n\n`;
  table += "| Role | Summary |\n| :--- | :--- |\n";
  let hasRoles = false;

  // Sort files alphabetically by filename
  files.sort().forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const { data, content: body } = matter(content);
    
    // Skip if it's the category overview page (same as folder name)
    const fileName = path.basename(file, '.mdx');
    if (fileName === category) return;

    // Use 'summary' from frontmatter if present, otherwise extract from body
    let summary = data.summary;
    
    if (!summary) {
      // Fallback: Extract the first non-header, non-empty paragraph
      const lines = body.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('<') && !trimmed.startsWith('import')) {
          summary = trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*/g, '');
          break;
        }
      }
    }

    table += `| **${data.title}** | ${summary || ""} |\n`;
    hasRoles = true;
  });

  if (hasRoles) {
    sections += table;
  }
});

const content = `---
title: Role Reference Sheet
slug: /role-reference
sidebar_class_name: hidden
---

# Role Reference Sheet

This is a quick summary of all roles available in CCK Werewolves.

${sections}

:::info
This page is automatically generated from the role documentation.
:::
`;

fs.writeFileSync(outputFile, content);
console.log('Role summary generated at ' + outputFile);
