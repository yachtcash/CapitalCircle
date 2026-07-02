import { ArrowRight } from "lucide-react";
import CapitalCircleMark from "@/components/brand/CapitalCircleMark";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cream flex items-center justify-center px-5 py-20">
      <div className="text-center max-w-md">
        <CapitalCircleMark className="h-14 w-14 mx-auto" />
        <div className="mt-6 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Capital Circle
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-navy-900 tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm md:text-[15px] text-navy-700/70 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to the marketplace.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Button
            href="/"
            className="group"
            iconRight={
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.4}
              />
            }
          >
            Back to home
          </Button>
          <Button variant="outline" href="/opportunities">
            Browse opportunities
          </Button>
        </div>
      </div>
    </div>
  );
}
