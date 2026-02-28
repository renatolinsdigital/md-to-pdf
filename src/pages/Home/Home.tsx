import { Link } from 'react-router-dom';
import { FiFileText, FiEye, FiType, FiDownload, FiArrowRight } from 'react-icons/fi';
import { Button } from '@shared/components/Button/Button';
import styles from './Home.module.scss';

const features = [
  {
    icon: FiEye,
    title: 'Live Preview',
    description:
      'See your markdown rendered in real-time as you type. What you see is what you get.',
  },
  {
    icon: FiType,
    title: 'Rich Formatting',
    description: 'Bold, italic, colored text, headings, lists, code blocks, tables, and more.',
  },
  {
    icon: FiFileText,
    title: 'Custom Styling',
    description: 'Change background colors, adjust margins, configure page numbering text.',
  },
  {
    icon: FiDownload,
    title: 'Vector PDF',
    description:
      'Generate high-quality vector PDFs with selectable text and professional page numbering.',
  },
];

export function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Free Converter</span>
          <h1 className={styles.heroTitle}>
            Convert <span className={styles.highlight}>Markdown</span> to beautiful PDFs
          </h1>
          <p className={styles.heroDescription}>
            A powerful, client-side markdown to PDF converter with live preview, rich text
            formatting, custom styling, and professional page numbering. No server required.
          </p>
          <div className={styles.heroCta}>
            <Link to="/converter">
              <Button variant="primary" size="lg">
                Start Converting
                <FiArrowRight />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.mockEditor}>
            <div className={styles.mockHeader}>
              <div className={styles.mockDots}>
                <span />
                <span />
                <span />
              </div>
              <span className={styles.mockTitle}>document.md</span>
            </div>
            <div className={styles.mockBody}>
              <code>
                # Hello World{'\n\n'}
                This is **bold** and *italic* text.{'\n\n'}
                {'>'} A blockquote for emphasis{'\n\n'}- Item one{'\n'}- Item two{'\n'}- Item three
              </code>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Everything you need</h2>
        <p className={styles.featuresSubtitle}>
          Powerful features to create professional PDF documents from markdown
        </p>
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <feature.icon />
              </div>
              <h3 className={styles.featureCardTitle}>{feature.title}</h3>
              <p className={styles.featureCardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to convert?</h2>
        <p className={styles.ctaDescription}>
          Start converting your markdown to beautifully formatted PDFs in seconds.
        </p>
        <Link to="/converter">
          <Button variant="primary" size="lg">
            Go to Converter
            <FiArrowRight />
          </Button>
        </Link>
      </section>
    </div>
  );
}
