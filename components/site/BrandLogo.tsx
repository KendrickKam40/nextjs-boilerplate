import Image from 'next/image';
import styles from './BrandLogo.module.css';

const logos = {
  dark: { src: '/BalibuLogo.png', width: 1340, height: 1173 },
  light: { src: '/BalibuLogoLight.png', width: 923, height: 792 },
};

/** Keep the original brush circle, hand lettering and red “i” consistent. */
export default function BrandLogo({
  tone = 'dark',
  className = '',
  sizes = '108px',
  priority = false,
}: {
  tone?: keyof typeof logos;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <Image
      {...logos[tone]}
      alt="Balibu"
      className={`${styles.logo} ${className}`}
      sizes={sizes}
      priority={priority}
    />
  );
}
