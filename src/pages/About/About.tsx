import { useState, type FormEvent } from 'react';
import { FiMail, FiGithub, FiHeart } from 'react-icons/fi';
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
          A modern, client-side markdown to PDF converter built with React. No server, no uploads —
          everything happens in your browser.
        </p>
      </section>

      <section className={styles.content}>
        <div className={styles.info}>
          <div className={styles.card}>
            <FiHeart className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Free Software</h2>
            <p className={styles.cardDescription}>
              MD to PDF is 100% free! Built with love using React, Vite, and @react-pdf/renderer for
              high-quality vector PDF generation with selectable text.
            </p>
          </div>

          <div className={styles.card}>
            <FiGithub className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Tech Stack</h2>
            <ul className={styles.techList}>
              <li>React + TypeScript</li>
              <li>Vite + SCSS Modules</li>
              <li>@react-pdf/renderer (PDF)</li>
              <li>unified + remark + rehype</li>
              <li>pdfjs-dist (preview)</li>
              <li>react-colorful</li>
            </ul>
          </div>
        </div>

        <div className={styles.contactSection}>
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
    </div>
  );
}
