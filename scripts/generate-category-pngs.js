const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const matter = require('gray-matter');
const { globSync } = require('glob');

const docsDir = path.join(__dirname, '../docs');
const outputDir = path.join(__dirname, '../docs/assets/category-pngs');
const fontPath = path.join(__dirname, 'fonts/Roboto-Bold.ttf');
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load assets
const fontData = fs.readFileSync(fontPath);
const movementIconBuffer = fs.readFileSync(path.join(assetsDir, 'movement.svg'));
const movementIconBase64 = `data:image/svg+xml;base64,${movementIconBuffer.toString('base64')}`;

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

const categoryColors = {
  'village': '#4caf50',
  'wolfpack': '#f44336',
  'coven': '#9c27b0',
  'undead': '#795548',
  'vampires': '#e91e63',
  'neutral': '#ffeb3b',
  'bloodmoon-cult': '#ff9800',
  'holiday-roles': '#00bcd4'
};

function getCategoryTemplate(category, roles, height = '100%') {
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
        border: `12px solid ${categoryColors[category] || '#fff'}`,
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: '60px',
              fontWeight: 'bold',
              marginBottom: '60px',
              color: categoryColors[category] || '#fff',
              borderBottom: `2px solid ${categoryColors[category] || '#fff'}`,
              paddingBottom: '10px',
            },
            children: categoryLabels[category],
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
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: categoryColors[category] || '#fff',
                        marginBottom: '4px',
                      },
                      children: [
                        { type: 'span', props: { children: role.title } },
                        role.moves && {
                          type: 'img',
                          props: {
                            src: movementIconBase64,
                            style: { 
                              marginLeft: '10px', 
                              opacity: 0.8,
                              width: '24px',
                              height: '24px'
                            }
                          }
                        }
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
              opacity: 0.4,
              textAlign: 'right',
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
            },
            children: 'werewolf.chaotic-coven.com',
          },
        },
      ],
    },
  };
}

async function generateImages() {
  for (const category of categories) {
    const files = globSync(path.join(docsDir, category, '*.mdx').replace(/\\/g, '/'));
    const roles = files
      .map(file => {
        const content = fs.readFileSync(file, 'utf8');
        const { data, content: body } = matter(content);
        const fileName = path.basename(file, '.mdx');
        if (fileName === category) return null;

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
        return { title: data.title, summary: summary || "", moves: data.moves === true };
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title));

    console.log(`Generating image for ${category} (${roles.length} roles)...`);

    // Pass 1: Render with a very large height to find the actual content height
    const dryRunSvg = await satori(
      getCategoryTemplate(category, roles, 'auto'), // Use auto height to get accurate measurement
      {
        width: 1000,
        height: 10000, // Large enough for any category
        fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
      }
    );

    // Satori calculates the layout height and puts it in the first <rect> (the background)
    // We extract this value from the SVG string
    const heightMatch = dryRunSvg.match(/<rect x="0" y="0" width="1000" height="(\d+(?:\.\d+)?)"/);
    const actualHeight = heightMatch ? parseFloat(heightMatch[1]) : 1000;
    
    // Use the exact measured height
    const finalHeight = Math.ceil(actualHeight);

    console.log(`  Measured height: ${actualHeight}px. Final height: ${finalHeight}px.`);

    // Pass 2: Final render with the exact height
    const finalSvg = await satori(
      getCategoryTemplate(category, roles, '100%'),
      {
        width: 1000,
        height: finalHeight,
        fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
      }
    );

    const resvgFinal = new Resvg(finalSvg, { background: '#1b1b1d' });
    const pngBuffer = resvgFinal.render().asPng();

    fs.writeFileSync(path.join(outputDir, `${category}.png`), pngBuffer);
  }
}

generateImages().then(() => console.log('All category PNGs generated with precise height!')).catch(console.error);
