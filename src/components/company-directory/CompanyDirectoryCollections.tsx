import { Library } from "lucide-react";
import CompanyCollectionRow from "./CompanyCollectionRow";
import { COMPANY_COLLECTIONS } from "@/data/company-directory/collections";

export default function CompanyDirectoryCollections() {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-8 md:pt-12 pb-2">
        <div className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold inline-flex items-center gap-1.5">
          <Library className="h-3.5 w-3.5" strokeWidth={2.2} />
          Curated collections
        </div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
          Browse by sector
        </h2>
      </div>
      {COMPANY_COLLECTIONS.map((collection) => (
        <CompanyCollectionRow key={collection.slug} collection={collection} />
      ))}
    </section>
  );
}
