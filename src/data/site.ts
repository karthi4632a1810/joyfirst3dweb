/**
 * Site-wide settings.
 *
 * Contact details, addresses, certifications and social links below were taken
 * from the existing joyfirst.in site and are REAL. Do not alter them without
 * confirmation from the studio.
 */

export const site = {
  name: "JOYFIRST",
  legalName: "Joy First Interiors",
  tagline: "Architecture that feels like home.",
  description:
    "JOYFIRST creates thoughtful architecture, interior spaces and contemporary environments designed around the way people live.",
  /**
   * Canonical origin. Override with NEXT_PUBLIC_SITE_URL on preview
   * deployments so canonical URLs and OG images do not point at production.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://joyfirst.in",
  locale: "en_IN",
  founded: "2018",
  founder: "J. Arjun",

  contact: {
    email: "info@joyfirst.in",
    emailSecondary: "arjun@joyfirst.in",
    phone: "+91 78450 50502",
    phoneSecondary: "+91 86676 88023",
    landline: "044 4860 4600",
  },

  addresses: {
    registered: {
      label: "Registered Office",
      lines: [
        "#17, Shanthi Flats, C1",
        "N.V. Street, Mylapore",
        "Chennai 600 004",
        "Tamil Nadu, India",
      ],
    },
    studio: {
      label: "Studio",
      lines: [
        "#61, F, Ground Floor",
        "Subham Apartments, Anna Street",
        "Thiruvanmiyur, Chennai",
        "Tamil Nadu, India",
      ],
    },
  },

  /** States the studio delivers projects in. */
  network: [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Telangana",
    "Maharashtra",
    "Gujarat",
    "Punjab",
  ],

  certifications: ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018"],

  social: [
    { label: "Instagram", href: "https://www.instagram.com/joy_first_interiors" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/joyfirst-interiors/" },
    {
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61561210414421",
    },
  ],
} as const;

export const navigation = [
  { label: "Projects", href: "/projects" },
  { label: "Architecture", href: "/architecture" },
  { label: "Interiors", href: "/interiors" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNavigation = {
  work: [
    { label: "All Projects", href: "/projects" },
    { label: "Architecture", href: "/architecture" },
    { label: "Interiors", href: "/interiors" },
  ],
  studio: [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
