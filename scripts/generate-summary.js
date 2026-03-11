const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { globSync } = require('glob');
const { categories, categoryLabels } = require('./config');

const docsDir = path.join(__dirname, '../docs');
const outputFile = path.join(__dirname, '../docs/role-summary.mdx');

let sections = "";
let cardThumbnails = "";
let allRolesData = [["Role", "Category", "Summary"]];

categories.forEach(category => {
  const files = globSync(path.join(docsDir, category, '*.mdx').replace(/\\/g, '/'));
  
  if (files.length === 0) return;

  let table = `\n## ${categoryLabels[category]}\n\n`;
  table += "| Role | Summary |\n| :--- | :--- |\n";
  let hasRoles = false;

  // Add to cards section
  cardThumbnails += `#### ${categoryLabels[category]}\n\n`;
  cardThumbnails += `[<img src="/category-cards/${category}.png" width="200" height="200" style={{objectFit: 'cover', borderRadius: '8px', border: '1px solid #444'}} alt="${categoryLabels[category]} Card" />](/category-cards/${category}.png)\n\n`;

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
          summary = trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*/g, '').replace(/"/g, '""');
          break;
        }
      }
    }

    table += `| **${data.title}** | ${summary || ""} |\n`;
    allRolesData.push([data.title, categoryLabels[category], summary || ""]);
    hasRoles = true;
  });

  if (hasRoles) {
    sections += table;
  }
});

// Generate CSV
const csvContent = allRolesData.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
fs.writeFileSync(csvFile, csvContent);
console.log('CSV generated at ' + csvFile);

const content = `---
title: Role Reference Sheet
slug: /role-reference
sidebar_class_name: hidden
toc_min_heading_level: 2
toc_max_heading_level: 5
---

# Role Reference Sheet

This is a quick summary of all roles available in CCK Werewolves.

${sections}

## Downloadable Cheat Sheets

### Spreadsheets

- [Download Roles Reference (CSV)](/roles-reference.csv)

### Cards

${cardThumbnails}



:::info
This page is automatically generated from the role documentation.
:::
`;

fs.writeFileSync(outputFile, content);
console.log('Role summary generated at ' + outputFile);
