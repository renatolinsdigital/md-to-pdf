import { Link } from 'react-router-dom';
import {
  FiFileText,
  FiEye,
  FiType,
  FiDownload,
  FiArrowRight,
  FiEdit3,
  FiGlobe,
  FiCpu,
  FiBookOpen,
  FiCode,
  FiLayers,
  FiRotateCcw,
} from 'react-icons/fi';
import { Button } from '@shared/components/Button/Button';
import styles from './Home.module.scss';

const FEATURES = [
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
  {
    icon: FiRotateCcw,
    title: 'Undo & Redo',
    description:
      'Full undo/redo support in the editor. Press Ctrl+Z to undo and Ctrl+Shift+Z to redo, with an adjustable history size.',
  },
];

const WHY_MARKDOWN_REASONS = [
  {
    icon: FiEdit3,
    title: 'Easy to Write',
    description:
      'Simple, intuitive syntax that anyone can learn in minutes. No complex toolbars or formatting menus. Just type.',
  },
  {
    icon: FiCode,
    title: 'Pure Text',
    description:
      "Markdown files are plain text. They're lightweight, diffable, version-controllable, and will never become unreadable due to proprietary formats.",
  },
  {
    icon: FiGlobe,
    title: 'Widely Adopted',
    description:
      'GitHub, GitLab, Stack Overflow, Reddit, Notion, and countless other platforms use Markdown as their primary content format.',
  },
  {
    icon: FiLayers,
    title: 'Consistent Formatting',
    description:
      'Standardized marks produce predictable output everywhere: headings, lists, emphasis, code blocks, and tables always look right.',
  },
  {
    icon: FiCpu,
    title: 'AI-Friendly',
    description:
      'ChatGPT, Claude, Gemini, and other AI assistants output Markdown by default. Convert their responses directly into polished PDFs.',
  },
  {
    icon: FiBookOpen,
    title: 'Built for Docs',
    description:
      "READMEs, wikis, API references, technical specs: the documentation world runs on Markdown. It's portable and transferable to any system.",
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
          {FEATURES.map((feature) => (
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

      <section className={styles.whyMarkdown}>
        <h2 className={styles.whyTitle}>Why Markdown?</h2>
        <p className={styles.whySubtitle}>
          Markdown has become the go-to format for writing structured content, and for good reason.
        </p>
        <div className={styles.whyGrid}>
          {WHY_MARKDOWN_REASONS.map((reason) => (
            <div key={reason.title} className={styles.whyCard}>
              <reason.icon className={styles.whyIcon} />
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
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
