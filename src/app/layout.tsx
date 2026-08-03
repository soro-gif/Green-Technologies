import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Green Technologies | Eau, Énergie Solaire, Agrotechnologies & BTP en Côte d'Ivoire",
  description:
    "Solutions intelligentes et durables en Côte d'Ivoire : filtration d'eau potable, forages hydrauliques, centrales solaires photovoltaïques, irrigation agricole connectée et équipements BTP. Siège à Abidjan Cocody II Plateaux Latrille.",
  keywords: [
    "Green Technologies Abidjan",
    "Traitement eau Côte d'Ivoire",
    "Filtration eau potable",
    "Forage hydraulique Abidjan",
    "Panneaux solaires Côte d'Ivoire",
    "Pompage solaire agricole",
    "Irrigation intelligente",
    "Équipements BTP Abidjan",
    "Château d'eau Côte d'Ivoire",
    "Agrotechnologie Afrique de l'Ouest",
  ],
  authors: [{ name: "Green Technologies BTP" }],
  creator: "Green Technologies BTP",
  openGraph: {
    title: "Green Technologies | Solutions Intelligentes pour l'Eau, l'Énergie & le BTP",
    description:
      "Expertise de pointe en purification d'eau, énergie solaire, agrotechnologies et équipements BTP pour particuliers, entreprises, collectivités et exploitations agricoles.",
    url: "https://greentechnologies.ci",
    siteName: "Green Technologies BTP",
    locale: "fr_CI",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Green Technologies BTP",
    image: "https://greentechnologies.ci/logo.png",
    "@id": "https://greentechnologies.ci",
    url: "https://greentechnologies.ci",
    telephone: "+2250704901064",
    email: "greentechnologiesbtp@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Cocody II Plateaux Latrille",
      addressLocality: "Abidjan",
      addressCountry: "CI",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 5.368,
      longitude: -3.992,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:30",
    },
    priceRange: "$$",
    slogan: "Des solutions intelligentes pour l'eau, l'énergie et les infrastructures durables.",
  };

  return (
    <html lang="fr" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
