import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedServices } from "@/components/home/featured-services"
import { HeroSection } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { WhyChooseUs } from "@/components/home/why-choose-us"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedServices />
      <HowItWorks />
      <CategoriesSection />
      <WhyChooseUs />
    </>
  )
}
