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
  'village': 'Village',
  'wolfpack': 'Wolfpack',
  'coven': 'Coven',
  'undead': 'Undead',
  'vampires': 'Vampires',
  'neutral': 'Neutral',
  'bloodmoon-cult': 'Bloodmoon Cult',
  'holiday-roles': 'Holiday'
};

let table = "| Role | Category | Summary |\n| :--- | :--- | :--- |\n";

categories.forEach(category => {
  const files = globSync(path.join(docsDir, category, '*.mdx').replace(/\\/g, '/'));
  
  // Sort files alphabetically by filename
  files.sort().forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const { data, content: body } = matter(content);
    
    // Skip if it's the category overview page (same as folder name)
    const fileName = path.basename(file, '.mdx');
    if (fileName === category) return;

    // Extract the first non-header, non-empty paragraph
    const lines = body.split('\n');
    let summary = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('<') && !trimmed.startsWith('import')) {
        summary = trimmed;
        break;
      }
    }

    // Clean up markdown links or formatting from summary for the table
    const cleanSummary = summary.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*/g, '');
    const shortSummary = cleanSummary.length > 150 ? cleanSummary.substring(0, 147) + '...' : cleanSummary;

    table += `| **${data.title}** | ${categoryLabels[category]} | ${shortSummary} |
`;
  });
});

const content = `---
title: Role Reference Sheet
slug: /role-reference
sidebar_class_name: hidden
---

# Role Reference Sheet

This is a quick summary of all roles available in CCK Werewolves.

${table}

:::info
This page is automatically generated from the role documentation.
:::
`;

fs.writeFileSync(outputFile, content);
console.log('Role summary generated at ' + outputFile);
