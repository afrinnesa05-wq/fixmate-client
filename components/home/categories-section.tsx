import { CategoryCard } from "@/components/category-card"
import { SectionHeading } from "@/components/section-heading"
import { categories } from "@/lib/data"

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <SectionHeading
        eyebrow="Popular Categories"
        title="Repairs for every device at home"
        description="Pick a category to see available technicians and starting prices near you."
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </section>
  )
}
