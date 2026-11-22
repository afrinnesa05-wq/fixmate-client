import type { Category } from "./types"

export const categories: Category[] = [
  {
    slug: "smartphone",
    name: "Smartphone",
    description: "Screen, battery and charging repairs for all major phone brands.",
    image: "/images/service-smartphone-repair.jpg",
  },
  {
    slug: "laptop-pc",
    name: "Laptop & PC",
    description: "Diagnostics, upgrades and hardware repairs for laptops and desktops.",
    image: "/images/service-laptop-repair.jpg",
  },
  {
    slug: "ac",
    name: "AC",
    description: "Cooling faults, gas checks and deep cleaning for split and window units.",
    image: "/images/service-ac-repair.jpg",
  },
  {
    slug: "refrigerator",
    name: "Refrigerator",
    description: "Cooling issues, compressor faults and door seal fixes for fridges and freezers.",
    image: "/images/service-refrigerator-repair.jpg",
  },
  {
    slug: "tv",
    name: "TV",
    description: "Panel, power board and sound repairs for LED, OLED and smart TVs.",
    image: "/images/service-tv-repair.jpg",
  },
  {
    slug: "washing-machine",
    name: "Washing Machine",
    description: "Drainage, drum, belt and control board repairs for washers and dryers.",
    image: "/images/service-washing-machine-repair.jpg",
  },
  {
    slug: "electrical",
    name: "Electrical",
    description: "Sockets, switches, lighting and breaker faults handled by certified electricians.",
    image: "/images/service-electrical-repair.jpg",
  },
]

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug)
}
