/**
 * Builds the LocalBusiness + Person JSON-LD for the /about page.
 * Kept in a separate file so the schema stays close to the data it describes
 * and can be unit-tested without mounting the component.
 */

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface Stat {
  label: string;
  value: string;
}

interface AboutSchemaOptions {
  team: TeamMember[];
  stats: Stat[];
  pageTitle: string;
  pageDescription: string;
}

export function buildAboutPageSchema(opts: AboutSchemaOptions): object {
  const { team, stats, pageTitle, pageDescription } = opts;

  const founder = team[0]; // Uma is always first

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // ── BeautySalon — shares @id with index.html so Google merges them ──
      {
        '@type': ['BeautySalon', 'LocalBusiness'],
        '@id': 'https://nailsbyuma.onspace.app/#business',
        name: 'Nails by Uma',
        url: 'https://nailsbyuma.onspace.app',
        description: pageDescription,
        founder: {
          '@type': 'Person',
          name: founder.name,
          jobTitle: founder.role,
          image: founder.image,
          description: founder.bio,
          worksFor: {
            '@type': 'BeautySalon',
            name: 'Nails by Uma',
          },
        },
        employee: team.slice(1).map(member => ({
          '@type': 'Person',
          name: member.name,
          jobTitle: member.role,
          image: member.image,
          description: member.bio,
        })),
        numberOfEmployees: {
          '@type': 'QuantitativeValue',
          value: team.length,
        },
        additionalProperty: stats.map(stat => ({
          '@type': 'PropertyValue',
          name: stat.label,
          value: stat.value,
        })),
      },
      // ── WebPage for /about ────────────────────────────────────────────
      {
        '@type': 'AboutPage',
        '@id': 'https://nailsbyuma.onspace.app/about',
        url: 'https://nailsbyuma.onspace.app/about',
        name: pageTitle,
        description: pageDescription,
        isPartOf: {
          '@id': 'https://nailsbyuma.onspace.app/#business',
        },
      },
    ],
  };
}
