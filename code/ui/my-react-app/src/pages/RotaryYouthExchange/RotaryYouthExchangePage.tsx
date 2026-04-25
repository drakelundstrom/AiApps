import type { CSSProperties } from 'react'

interface HighlightProject {
  name: string
  summary: string
  details: string
}

const HIGHLIGHT_PROJECTS: HighlightProject[] = [
  {
    name: 'End Polio Now',
    summary: 'A decades-long global public health campaign led by Rotary and partners.',
    details:
      'Rotary members help fund immunization, support health workers, and coordinate local outreach in hard-to-reach communities.',
  },
  {
    name: 'Rotary Peace Centers',
    summary: 'Graduate-level fellowships that train peace and development leaders.',
    details:
      'Scholars study conflict prevention, mediation, and sustainable community building at partner universities around the world.',
  },
  {
    name: 'Disaster Response with ShelterBox',
    summary: 'Rotary clubs often team up with ShelterBox to support families after disasters.',
    details:
      'Projects focus on emergency shelter, critical supplies, and practical recovery support when communities are most vulnerable.',
  },
]

const styles = {
  page: {
    background: 'linear-gradient(145deg, #102a43 0%, #1f7a8c 52%, #f6bd60 100%)',
  } satisfies CSSProperties,
  card: {
    maxWidth: 900,
    padding: '28px 24px',
    display: 'grid',
    gap: 20,
  } satisfies CSSProperties,
  heading: {
    margin: 0,
    fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
    lineHeight: 1.1,
  } satisfies CSSProperties,
  subheading: {
    margin: 0,
    opacity: 0.88,
    lineHeight: 1.65,
  } satisfies CSSProperties,
  sectionTitle: {
    margin: 0,
    color: '#d8f3ff',
    fontSize: '1.2rem',
  } satisfies CSSProperties,
  paragraph: {
    margin: 0,
    lineHeight: 1.65,
    opacity: 0.9,
  } satisfies CSSProperties,
  projects: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gap: 12,
  } satisfies CSSProperties,
  projectCard: {
    background: 'rgba(6, 19, 31, 0.4)',
    border: '1px solid rgba(216, 243, 255, 0.2)',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'grid',
    gap: 6,
  } satisfies CSSProperties,
  projectName: {
    margin: 0,
    fontSize: '1rem',
    color: '#f6fffe',
  } satisfies CSSProperties,
  linkRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  } satisfies CSSProperties,
  link: {
    color: '#e5fbff',
    fontWeight: 700,
  } satisfies CSSProperties,
} as const

export default function RotaryYouthExchangePage() {
  return (
    <section className="page-container" style={styles.page}>
      <article className="glass-card" style={styles.card}>
        <header>
          <h1 style={styles.heading}>Rotary and Rotary Youth Exchange</h1>
          <p style={styles.subheading}>
            Rotary is a global service organization where local clubs collaborate on real-world
            community impact. Rotary Youth Exchange is one of its most inspiring programs: students
            live abroad, attend school, and build lifelong cross-cultural friendships while serving
            their host communities.
          </p>
        </header>

        <section>
          <h2 style={styles.sectionTitle}>What Rotary Is</h2>
          <p style={styles.paragraph}>
            Rotary clubs bring together neighbors, professionals, and volunteers to take action on
            education, clean water, health, economic opportunity, and peacebuilding. The focus is
            practical service: identify a need, form a team, and deliver meaningful results.
          </p>
        </section>

        <section>
          <h2 style={styles.sectionTitle}>What Rotary Youth Exchange Is</h2>
          <p style={styles.paragraph}>
            Rotary Youth Exchange gives high-school students the chance to spend an academic year or
            shorter exchange abroad with host families. Beyond language skills and travel, students
            gain confidence, adaptability, and a broader worldview that shapes their futures.
          </p>
        </section>

        <section>
          <h2 style={styles.sectionTitle}>Cool Rotary Projects</h2>
          <ul style={styles.projects}>
            {HIGHLIGHT_PROJECTS.map((project) => (
              <li key={project.name} style={styles.projectCard}>
                <h3 style={styles.projectName}>{project.name}</h3>
                <p style={styles.paragraph}>{project.summary}</p>
                <p style={styles.paragraph}>{project.details}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 style={styles.sectionTitle}>Learn More</h2>
          <p style={styles.paragraph}>
            If you are in central Ohio, District 6690 is a great place to explore local clubs,
            Youth Exchange opportunities, and service events.
          </p>
          <p style={styles.linkRow}>
            <a href="https://www.rotary6690.org/" target="_blank" rel="noopener noreferrer" style={styles.link}>
              Rotary District 6690
            </a>
            <a href="https://www.rotary.org/en/our-programs/youth-exchanges" target="_blank" rel="noopener noreferrer" style={styles.link}>
              Rotary Youth Exchange (Global)
            </a>
          </p>
        </section>
      </article>
    </section>
  )
}