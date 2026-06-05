import Image from "next/image";
import { Images, Maximize2 } from "lucide-react";

type Props = {
  images: string[];
  title: string;
};

export default function ImageGallery({ images, title }: Props) {
  if (!images.length) return null;

  return (
    <section className="bg-cream">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
              <Images className="h-3.5 w-3.5" strokeWidth={2.2} />
              Gallery · {images.length} photos
            </div>
            <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
              See the property
            </h2>
          </div>
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 bg-white hover:bg-bone ring-1 ring-navy-900/10 rounded-full px-4 py-2 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.4} />
            View all photos
          </button>
        </div>

        {/* Airbnb-style mosaic: large left + 2x2 grid right (desktop), single + scroll row (mobile) */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2.5 h-[480px] rounded-2xl overflow-hidden">
          <Tile src={images[0]} alt={`${title} — Photo 1`} className="col-span-2 row-span-2" />
          {[1, 2, 3, 4].map((i) => {
            const src = images[i] ?? images[i % images.length];
            return (
              <Tile
                key={i}
                src={src}
                alt={`${title} — Photo ${i + 1}`}
                className="col-span-1 row-span-1"
              />
            );
          })}
        </div>

        {/* Mobile: featured + horizontal scroll for the rest */}
        <div className="md:hidden">
          <Tile
            src={images[0]}
            alt={`${title} — Photo 1`}
            className="aspect-[4/3] rounded-2xl"
          />
          <div className="mt-2.5 flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 -mx-5 px-5">
            {images.slice(1).map((src, i) => (
              <div
                key={src + i}
                className="relative shrink-0 w-2/3 aspect-[4/3] rounded-xl overflow-hidden snap-start bg-navy-900/5"
              >
                <Image
                  src={src}
                  alt={`${title} — Photo ${i + 2}`}
                  fill
                  sizes="66vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-navy-900/5 ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 600px, (min-width: 768px) 50vw, 100vw"
        className="object-cover hover:scale-105 transition-transform duration-700"
      />
    </div>
  );
}
