import { useState, type FormEvent } from 'react';
import {
  FiMail,
  FiHeart,
  FiBookOpen,
  FiEdit3,
  FiRotateCcw,
  FiSettings,
  FiZap,
  FiShield,
} from 'react-icons/fi';
import { Input } from '@shared/components/Input/Input';
import { Textarea } from '@shared/components/Textarea/Textarea';
import { Button } from '@shared/components/Button/Button';
import { useToast } from '@domain/hooks/useToast';
import styles from './About.module.scss';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function About() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    showToast('Message sent successfully!', 'success');
    setFormData({ name: '', email: '', message: '' });
    setErrors({});
  };

  return (
    <div className={styles.about}>
      <section className={styles.hero}>
        <h1 className={styles.title}>About MD to PDF</h1>
        <p className={styles.subtitle}>
          A modern, client-side Markdown to PDF converter. No server, no uploads. Everything happens
          right in your browser.
        </p>
      </section>

      <section className={styles.guide}>
        <h2 className={styles.guideTitle}>How It Works</h2>
        <p className={styles.guideSubtitle}>
          Everything you need to know to create beautiful PDFs from Markdown.
        </p>

        <div className={styles.guideGrid}>
          <div className={styles.guideCard}>
            <FiBookOpen className={styles.guideIcon} />
            <h3>What is Markdown?</h3>
            <p>
              Markdown is a lightweight text formatting language. Instead of clicking toolbar
              buttons like in Word, you write simple symbols: <code>**bold**</code> for{' '}
              <strong>bold</strong>, <code>*italic*</code> for <em>italic</em>,{' '}
              <code># Heading</code> for headings, and <code>- item</code> for bullet lists.
              It&apos;s used on GitHub, Reddit, Notion, and most developer tools.
            </p>
          </div>

          <div className={styles.guideCard}>
            <FiEdit3 className={styles.guideIcon} />
            <h3>The Editor</h3>
            <p>
              Type or paste Markdown on the left and see a live PDF preview on the right. The
              formatting toolbar above the editor lets you insert bold, italic, headings, lists,
              links, images, code blocks, blockquotes, colored text, alignment wrappers, and image
              captions, all without memorizing syntax.
            </p>
          </div>

          <div className={styles.guideCard}>
            <FiRotateCcw className={styles.guideIcon} />
            <h3>Undo &amp; Redo</h3>
            <p>
              Made a mistake? Press <kbd>Ctrl+Z</kbd> to undo and <kbd>Ctrl+Shift+Z</kbd> (or{' '}
              <kbd>Ctrl+Y</kbd>) to redo. The editor keeps a configurable history (default 50
              steps). Rapid consecutive keystrokes are merged into a single undo step so you
              don&apos;t have to undo one character at a time.
            </p>
          </div>

          <div className={styles.guideCard}>
            <FiSettings className={styles.guideIcon} />
            <h3>Customization</h3>
            <p>
              Click <strong>Settings</strong> to open the configuration panel. You can change the
              page background and text colors, pick a decorative background pattern (48 icons with
              adjustable size, gap, opacity, and color), set page margins, choose a page size (A4,
              Letter, Legal), toggle page numbering with custom labels, and adjust the undo history
              size. All settings are saved automatically in your browser.
            </p>
          </div>

          <div className={`${styles.guideCard} ${styles.guideCardWide}`}>
            <FiZap className={styles.guideIcon} />
            <h3>Tips &amp; Tricks</h3>
            <ul className={styles.tipsList}>
              <li>
                Use <code>Load Example</code> to see every supported feature in action.
              </li>
              <li>
                Images are fetched and embedded. Use direct URLs ending in <code>.jpg</code> or{' '}
                <code>.png</code> for best results.
              </li>
              <li>
                Add captions below images with the <strong>Caption</strong> toolbar button for
                centered italic text.
              </li>
              <li>
                Wrap content in <code>&lt;div style=&quot;text-align: center&quot;&gt;</code> for
                centered sections.
              </li>
              <li>
                Use <code>&lt;span style=&quot;color: #3b82f6&quot;&gt;</code> or the color picker
                to colorize specific text.
              </li>
              <li>Everything runs client-side. Your content never leaves your browser.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.contact}>
        <div className={styles.contactInner}>
          <div className={styles.contactHeader}>
            <FiMail className={styles.contactIcon} />
            <h2 className={styles.contactTitle}>Get in Touch</h2>
            <p className={styles.contactDescription}>
              Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="Name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              fullWidth
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              fullWidth
            />
            <Textarea
              label="Message"
              placeholder="Tell us what you think..."
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              error={errors.message}
              fullWidth
              rows={5}
            />
            <Button type="submit" variant="primary" size="lg" fullWidth>
              Send Message
            </Button>
          </form>
        </div>
      </section>

      <section className={styles.banner}>
        <div className={styles.bannerItem}>
          <FiHeart className={styles.bannerIcon} />
          <div>
            <h3>100% Free</h3>
            <p>No subscriptions, no limits. Built with love and open for everyone.</p>
          </div>
        </div>
        <div className={styles.bannerDivider} />
        <div className={styles.bannerItem}>
          <FiShield className={styles.bannerIcon} />
          <div>
            <h3>Fully Private</h3>
            <p>Everything runs client-side. Your content never leaves your browser.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
