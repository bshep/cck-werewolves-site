const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const matter = require('gray-matter');
const { globSync } = require('glob');

const { 
  categoryColors, 
  categoryLabels,
  getRoleColor 
} = require('./config');

const docsDir = path.join(__dirname, '../docs');
const outputDir = path.join(__dirname, '../static/custom-cards');
const fontPath = path.join(__dirname, 'fonts/Roboto-Bold.ttf');
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load assets
const fontData = fs.readFileSync(fontPath);
const movementIconBuffer = fs.readFileSync(path.join(assetsDir, 'movement.svg'));
const movementIconBase64 = `data:image/svg+xml;base64,${movementIconBuffer.toString('base64')}`;
const killerIconBuffer = fs.readFileSync(path.join(assetsDir, 'killer.svg'));
const killerIconBase64 = `data:image/svg+xml;base64,${killerIconBuffer.toString('base64')}`;
const witchcraftIconBuffer = fs.readFileSync(path.join(assetsDir, 'witchcraft.svg'));
const witchcraftIconBase64 = `data:image/svg+xml;base64,${witchcraftIconBuffer.toString('base64')}`;
const prohibitedIconBuffer = fs.readFileSync(path.join(assetsDir, 'prohibited.svg'));
const prohibitedIconBase64 = `data:image/svg+xml;base64,${prohibitedIconBuffer.toString('base64')}`;

function renderIconWithStatus(iconBase64, isActive) {
  return {
    type: 'div',
    props: {
      style: { 
        position: 'relative', 
        display: 'flex', 
        marginLeft: '10px',
        width: '24px',
        height: '24px',
      },
      children: [
        {
          type: 'img',
          props: {
            src: iconBase64,
            style: { 
              opacity: isActive ? 0.8 : 0.15,
              width: '24px',
              height: '24px'
            }
          }
        },
        !isActive && {
          type: 'img',
          props: {
            src: prohibitedIconBase64,
            style: { 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '24px',
              height: '24px',
              opacity: 0.8
            }
          }
        }
      ].filter(Boolean)
    }
  };
}

function getCardTemplate(title, roles, color, height = '100%') {
  return {
    type: 'div',
    props: {
      style: {
        height: height,
        width: '1000px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1b1b1d',
        color: '#fff',
        fontFamily: 'Roboto',
        padding: '60px',
        border: `12px solid ${color || '#607d8b'}`,
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: '60px',
              fontWeight: 'bold',
              marginBottom: '40px',
              color: color || '#fff',
              borderBottom: `2px solid ${color || '#fff'}`,
              paddingBottom: '10px',
            },
            children: title,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: '100%',
              gap: '15px',
            },
            children: roles.map(role => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  width: '420px',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderLeft: `4px solid ${categoryColors[role.category] || '#fff'}`
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        opacity: 0.7,
                        color: categoryColors[role.category] || '#fff',
                        marginBottom: '4px'
                      },
                      children: `Team: ${categoryLabels[role.category] || role.category}`
                    }
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: role.color,
                        marginBottom: '4px',
                      },
                      children: [
                        { type: 'span', props: { children: role.title } },
                        renderIconWithStatus(movementIconBase64, role.moves),
                        renderIconWithStatus(killerIconBase64, role.killer),
                        renderIconWithStatus(witchcraftIconBase64, role.witchcraft)
                      ].filter(Boolean)
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '16px',
                        lineHeight: '1.4',
                        opacity: 0.9,
                      },
                      children: role.summary,
                    },
                  },
                ],
              },
            })),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              marginTop: '40px',
              fontSize: '18px',
              opacity: 0.5,
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '20px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'row', gap: '30px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center' },
                        children: [
                          { type: 'img', props: { src: movementIconBase64, style: { width: '20px', height: '20px', marginRight: '8px' } } },
                          { type: 'span', props: { children: 'Movement' } }
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center' },
                        children: [
                          { type: 'img', props: { src: killerIconBase64, style: { width: '20px', height: '20px', marginRight: '8px' } } },
                          { type: 'span', props: { children: 'Killer' } }
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center' },
                        children: [
                          { type: 'img', props: { src: witchcraftIconBase64, style: { width: '20px', height: '20px', marginRight: '8px' } } },
                          { type: 'span', props: { children: 'Witchcraft' } }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  children: 'werewolf.chaotic-coven.com',
                },
              }
            ],
          },
        },
      ],
    },
  };
}

async function generateCustomCard() {
  const args = process.argv.slice(2);
  let cardTitle = "Custom Role Selection";
  let outputFileName = "custom-card.png";
  const requestedRoles = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      cardTitle = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputFileName = args[i + 1];
      if (!outputFileName.endsWith('.png')) outputFileName += '.png';
      i++;
    } else {
      requestedRoles.push(args[i].toLowerCase());
    }
  }

  if (requestedRoles.length === 0) {
    console.error("Please provide a list of roles as arguments.");
    process.exit(1);
  }

  // Map all available roles
  const allFiles = globSync(path.join(docsDir, '**/*.mdx').replace(/\\/g, '/'));
  const rolesMap = {};

  allFiles.forEach(file => {
    const category = path.basename(path.dirname(file));
    const fileName = path.basename(file, '.mdx');
    if (fileName === category) return; // Skip category overview pages

    const content = fs.readFileSync(file, 'utf8');
    const { data, content: body } = matter(content);
    
    let summary = data.summary;
    if (!summary) {
      const lines = body.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('<') && !trimmed.startsWith('import')) {
          summary = trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*/g, '');
          break;
        }
      }
    }

    const roleData = {
      title: data.title,
      summary: summary || "",
      moves: data.moves === true,
      killer: data.killer === true,
      witchcraft: data.witchcraft === true,
      category: category,
      color: getRoleColor(data.member, category)
    };

    rolesMap[fileName.toLowerCase()] = roleData;
    rolesMap[data.title.toLowerCase()] = roleData;
  });

  const selectedRoles = requestedRoles
    .map(name => {
      const role = rolesMap[name];
      if (!role) console.warn(`Warning: Role "${name}" not found.`);
      return role;
    })
    .filter(Boolean);

  if (selectedRoles.length === 0) {
    console.error("No valid roles found.");
    process.exit(1);
  }

  console.log(`Generating custom card "${cardTitle}" with ${selectedRoles.length} roles...`);

  const primaryColor = selectedRoles[0].color || '#607d8b';

  // Pass 1: Measure
  const dryRunSvg = await satori(
    getCardTemplate(cardTitle, selectedRoles, primaryColor, 'auto'),
    {
      width: 1000,
      height: 10000,
      fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
    }
  );

  const heightMatch = dryRunSvg.match(/<rect x="0" y="0" width="1000" height="(\d+(?:\.\d+)?)"/);
  const finalHeight = heightMatch ? Math.ceil(parseFloat(heightMatch[1])) : 1000;

  // Pass 2: Final render
  const finalSvg = await satori(
    getCardTemplate(cardTitle, selectedRoles, primaryColor, '100%'),
    {
      width: 1000,
      height: finalHeight,
      fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
    }
  );

  const resvg = new Resvg(finalSvg, { background: '#1b1b1d' });
  const pngBuffer = resvg.render().asPng();

  const outputPath = path.join(outputDir, outputFileName);
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`Successfully generated custom card at ${outputPath}`);
}

generateCustomCard().catch(console.error);
