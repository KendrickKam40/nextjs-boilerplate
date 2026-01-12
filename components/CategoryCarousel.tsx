// components/CategoryCarousel.tsx
'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import NextImage from 'next/image';
import Button from '@/components/Button';
import { s } from 'framer-motion/client';

export type Category = {
  name: string;
  visible?: boolean;
  avalibleFrom?: string;
  avalibleTo?: string;
  days?: string[];
  order?: number;
};

export type MenuItem = {
  id?: string;
  name: string;
  shortName?: string;
  description?: string;
  category?: string;
  price?: number | string;
  order?: number;
  soldOut?: number;          // 1 means sold out
  showOnDisplay?: boolean;   // optional flag from API
  avalible?: number;     // optional flag from API
};

interface Props {
  heading?: string;
  subheading?: string;
  categories: Category[];          // already filtered/sorted from parent
  images?: string[];               // optional image pool to pair with cards
  imagesByCategory?: Record<string, string>; // explicit mapping if available
  menuItems?: MenuItem[];          // full menu items (from Home)
  onAllClick?: () => void;         // e.g. open the Order modal
  primaryColor?: string;           // for subtle accents if you want
}

/** Modal that lists menu items for a selected category */
function MenuModal({
  open,
  categoryName,
  items,
  onClose,
  primaryColor = '#d6112c',
}: {
  open: boolean;
  categoryName: string;
  items: MenuItem[];
  onClose: () => void;
  primaryColor?: string;
}) {
  // Currency helper (NZD)
  const fmt = useMemo(() => new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }), []);
  const price = (n: number | string | undefined) => {
    if (typeof n === 'number') return fmt.format(n);
    const v = Number(n);
    return Number.isFinite(v) ? fmt.format(v) : '';
  };

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`${categoryName} items`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4 modal-container">
        <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="sticky-header flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-2xl font-serif font-bold truncate">
              {categoryName}
            </h3>
            <button
              aria-label="Close"
              onClick={onClose}
              className="h-11 w-11 rounded-full grid place-items-center hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ color: primaryColor }}
            >
              ✕
            </button>
          </div>

          {/* List */}
          <div className="p-6 overflow-auto max-h-[calc(85vh-64px)]">
            {items.length === 0 ? (
              <p className="text-[#4A5058]">No items found in this category.</p>
            ) : (
              <ul className="divide-y">
                {items.map((it) => (
                  <li key={it.id ?? `${it.name}-${it.order ?? 0}` } className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3">
                          <h4 className="text-lg font-semibold">
                            {it.shortName || it.name}
                          </h4>
                          {it.soldOut === 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                              Sold out
                            </span>
                          )}
                        </div>
                        {it.description && (
                          <p className="text-sm text-[#4A5058] mt-1">{it.description}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-[#24333F] font-medium whitespace-nowrap">
                        {price(it.price)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryCarousel({
  heading = 'Explore by Category',
  subheading = 'From IndoFusion bowls to sweet treats — browse by what you’re craving.',
  categories,
  images = [],
  imagesByCategory = {},
  menuItems = [],
  onAllClick,
  primaryColor = '#d6112c',
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Track image load failures so we can gracefully fall back
  const [imgFailures, setImgFailures] = useState<Record<string, true>>({});
  // Cache of validated image URLs (true = valid, false = invalid)
  const [imgValid, setImgValid] = useState<Record<string, boolean>>({});
  // In-flight validation promises to dedupe HEAD requests
  const imgValidating = useRef<Record<string, Promise<boolean> | undefined>>({});

  // Default fallback image to use when category-specific images are missing
  const DEFAULT_CATEGORY_IMG = '/images/categories/default.png';

  // Known files in public/images/categories/balinese (avoid HEADing missing files)
  const AVAILABLE_BALI_SLUGS = new Set([
    'beef-dishes',
    'chicken-dishes',
    'milkshakes',
    'rice-and-noodles',
    'sauces',
    'slushies-and-ice-tea',
    'smoothies',
    'snacks',
    'soft-drinks',
    'soft-serve-ice-cream-and-yoghurt',
    'sundaes-vanilla-soft-serve',
    'sundaes-yoghurt-soft-serve',
    'vegetarian',
    'meals',
    'ice-cream-and-yoghurt',
    'shakes-smoothies-slushies',
  ]);

  // Slugify category names to map to local fallback images
  const slugify = (s: string) =>
    (s || '')
      .toLowerCase()
      .trim()
      .replace(/&/g, ' and ')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-');

  // Deterministic helpers
  const hashCode = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return Math.abs(h);
  };
  // Helper that checks whether a URL is a valid image by fetching its headers
  // We only fetch once per URL and cache the result in imgValid.
  const validateImage = async (url: string) => {
    if (!url) return false;
    if (typeof window === 'undefined') return false;
    if (imgValid[url] === true) return true;
    if (imgValid[url] === false) return false;
    // If another call already started validation for this URL, reuse it
    if (imgValidating.current[url]) return imgValidating.current[url];

    const p = (async () => {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        const ok = res.ok && /^image\//.test(res.headers.get('content-type') || '');
        setImgValid((m) => ({ ...m, [url]: ok }));
        if (!ok) setImgFailures((m) => ({ ...m, [url]: true }));
        return ok;
      } catch (e) {
        setImgValid((m) => ({ ...m, [url]: false }));
        setImgFailures((m) => ({ ...m, [url]: true }));
        return false;
      } finally {
        // cleanup in-flight map
        // use microtask to avoid React state updates inside finally causing issues
        setTimeout(() => { delete imgValidating.current[url]; }, 0);
      }
    })();

    imgValidating.current[url] = p;
    return p;
  };

  const pickImageFor = (name: string) => {
    const key = name.trim().toLowerCase();
    const explicit = imagesByCategory?.[key];
  // Prefer explicit mapping only if we've validated it as an image
  if (explicit && imgValid[explicit] === true) return explicit;

    // Try slug-based local image (preferred fallback): /public/images/categories/balinese/<slug>.png
    const slug = slugify(name);
  const candidatePng = `/images/categories/balinese/${slug}.png`;
  if (AVAILABLE_BALI_SLUGS.has(slug) && imgValid[candidatePng] === true) return candidatePng;

    // Final fallback: deterministic pick from provided pool (if any)
    if (images && images.length > 0) {
      const idx = hashCode(name) % images.length;
      const pooled = images[idx];
      if (pooled && imgValid[pooled] === true) return pooled;
    }

    // As last resort use a default category image (only if validated)
    if (imgValid[DEFAULT_CATEGORY_IMG] === true) return DEFAULT_CATEGORY_IMG;

    // No image available or all failed
    return '';
  };
  const initials = (name: string) => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('');
  };
  const gradientFor = (name: string) => {
    const h = hashCode(name) % 360;
    const h2 = (h + 24) % 360;
    return `linear-gradient(135deg, hsl(${h} 70% 92%), hsl(${h2} 70% 85%))`;
  };

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    const onScroll = () => updateArrows();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, []);

  // Pre-validate candidate images for the currently visible categories so we avoid
  // returning URLs that will 404 or return HTML (which causes the 'invalid image' console error).
  useEffect(() => {
    const candidates: string[] = [];
    categories.slice(0, 12).forEach((c) => {
      const name = c.name || '';
      const key = name.trim().toLowerCase();
      const explicit = imagesByCategory?.[key];
      if (explicit) {
        // If explicit mapping points to a balinese slug, only validate when slug exists
        const m = explicit.match(/\/images\/categories\/balinese\/([^./]+)\.(png|jpe?g)$/i);
        if (m) {
          const explicitSlug = m[1];
          if (AVAILABLE_BALI_SLUGS.has(explicitSlug) && !imgValid[explicit] && !imgFailures[explicit]) {
            candidates.push(explicit);
          }
        } else if (!imgValid[explicit] && !imgFailures[explicit]) {
          candidates.push(explicit);
        }
      }
      const slug = slugify(name);
      const png = `/images/categories/balinese/${slug}.png`;
      if (AVAILABLE_BALI_SLUGS.has(slug)) {
        if (!imgValid[png] && !imgFailures[png]) candidates.push(png);
      }
      if (images && images.length > 0) {
        const pooled = images[hashCode(name) % images.length];
        if (pooled && !imgValid[pooled] && !imgFailures[pooled]) candidates.push(pooled);
      }
    });
    // Dedupe candidates and validate sequentially to avoid many parallel requests on slow networks
    const deduped = Array.from(new Set(candidates));
    let cancelled = false;
    (async () => {
      for (const url of deduped) {
        if (cancelled) break;
        // eslint-disable-next-line no-await-in-loop
        await validateImage(url);
      }
      // also validate default image once
      if (!cancelled && !imgValid[DEFAULT_CATEGORY_IMG] && !imgFailures[DEFAULT_CATEGORY_IMG]) {
        // fire-and-forget
        validateImage(DEFAULT_CATEGORY_IMG);
      }
    })();

    return () => { cancelled = true; };
  }, [categories, images, imagesByCategory]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const amount = card ? card.offsetWidth + 24 /* gap */ : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  // Items to show in modal for selected category
  const itemsForSelected = useMemo(() => {
    if (!selectedCategory) return [];
    const targetSlug = slugify(selectedCategory);

    return (menuItems || [])
      .filter((it: any) => {
        const catSlug = slugify(it?.category || '');
        // const kioskOk = it?.showOnKiosk === true;       // per your requirement
        const soldOut = Number(it?.soldOut) === 1;      // handles '1' or 1
        const avalible = Number(it?.avalible) === 0; // 0 means available
        return catSlug === targetSlug && soldOut  && avalible;
      })
      .sort((a: any, b: any) => {
        const ao = Number.isFinite(a?.order) ? a.order : 9999;
        const bo = Number.isFinite(b?.order) ? b.order : 9999;
        if (ao !== bo) return ao - bo;
        return String(a?.name || '').localeCompare(String(b?.name || ''));
      });
  }, [selectedCategory, menuItems]);

  return (
    <section className="bg-[#ffffff] py-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left copy column */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-xs tracking-[0.2em] uppercase text-[#4A5058]">Our Menu</p>
          <h2 className="text-4xl font-serif font-bold">{heading}</h2>
          <p className="text-[#4A5058]">{subheading}</p>
          <div>
            <Button
              variant="outline"
              color={primaryColor}
              className="px-5 py-2 mt-2"
              onClick={onAllClick}
            >
              View Full Menu
            </Button>
          </div>
        </div>

        {/* Right carousel */}
        <div className="lg:col-span-3 relative">
          <div
            ref={trackRef}
            className="track flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 px-4 sm:px-6 lg:-mx-4 lg:px-4"
            role="group"
            aria-label="Category cards"
          >
            {categories.map((cat, i) => {
              const img = pickImageFor(cat.name);
              return (
                <article
                  key={`${cat.name}-${i}`}
                  data-card
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCategory(cat.name)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedCategory(cat.name); }}
                  className="card relative snap-start shrink-0 rounded-2xl overflow-hidden bg-[#f1e7da] shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
                  aria-label={cat.name}
                >
                  {/* Image priority: explicit map -> /images/categories/balinese/<slug>.png -> pooled -> initials */}
                  {img ? (
                    <NextImage
                      src={img}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 260px, 300px"
                      priority={i < 3}
                      onError={() => setImgFailures((m) => ({ ...m, [img]: true }))}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: gradientFor(cat.name) }}>
                      <span className="text-white/90 text-4xl font-serif font-bold drop-shadow" aria-hidden>
                        {initials(cat.name)}
                      </span>
                    </div>
                  )}

                  {/* subtle border accent */}
                  <div className="absolute inset-3 rounded-[14px] ring-1" style={{ boxShadow: `inset 0 0 0 1px ${primaryColor}20` }} />

                  {/* label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-4">
                    <p className="text-xs tracking-[0.2em] uppercase opacity-80">Category</p>
                    <h3 className="text-xl font-serif font-bold">{cat.name}</h3>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex justify-center lg:justify-end gap-3 mt-4">
            <button
              aria-label="Previous"
              onClick={() => scrollByCards(-1)}
              disabled={!canLeft}
              className="nav-btn h-10 w-10 flex items-center justify-center rounded-full shadow disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              ‹
            </button>
            <button
              aria-label="Next"
              onClick={() => scrollByCards(1)}
              disabled={!canRight}
              className="nav-btn h-10 w-10 flex items-center justify-center rounded-full shadow disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal listing items for selected category */}
      <MenuModal
        open={Boolean(selectedCategory)}
        categoryName={selectedCategory ?? ''}
        items={itemsForSelected}
        onClose={() => setSelectedCategory(null)}
        primaryColor={primaryColor}
      />

      <style jsx>{`
        /* Smooth momentum scrolling on iOS Safari, hide scrollbar */
        .track { 
          -webkit-overflow-scrolling: touch; 
          scrollbar-width: none; 
        }
        .track::-webkit-scrollbar { display: none; }

        /* Responsive card sizing on small screens */
        .card { width: 300px; height: 360px; }
        @media (max-width: 640px) {
          .card { width: 78vw; height: 300px; }
        }

        /* Sticky modal header for long lists */
        .sticky-header { position: sticky; top: 0; background: #fff; z-index: 1; }

        /* Respect safe areas on iOS */
        .modal-container { padding-bottom: env(safe-area-inset-bottom); }

        /* Ensure tap targets are big enough on mobile (Safari/Chrome) */
        .nav-btn { min-width: 44px; min-height: 44px; }
      `}</style>
    </section>
  );
}
