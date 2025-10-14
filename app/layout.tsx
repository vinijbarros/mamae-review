import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Mamãe Review - Reviews de Produtos para Mães",
    template: "%s | Mamãe Review",
  },
  description: "Plataforma onde mamães gestantes e recentes compartilham reviews de produtos essenciais para a maternidade. Encontre as melhores recomendações da nossa comunidade.",
  keywords: ["maternidade", "reviews", "produtos para bebê", "gestação", "mamães", "avaliações", "recomendações"],
  authors: [{ name: "Mamãe Review" }],
  creator: "Mamãe Review",
  publisher: "Mamãe Review",
  manifest: "/manifest.json",
  themeColor: "#f472b6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mamãe Review",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://mamae-review.vercel.app",
    siteName: "Mamãe Review",
    title: "Mamãe Review - Reviews de Produtos para Mães",
    description: "Plataforma onde mamães compartilham reviews de produtos essenciais para a maternidade.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Mamãe Review",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mamãe Review - Reviews de Produtos para Mães",
    description: "Encontre as melhores recomendações de produtos para mamães e bebês.",
    images: ["/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              
              <main className="flex-1 container mx-auto px-4 py-8">
                {children}
              </main>
              
              <footer className="border-t bg-background">
                <div className="container flex h-16 items-center justify-center px-4">
                  <p className="text-sm text-muted-foreground">
                    © 2024 Mamãe Review. Feito com ❤️ para mamães.
                  </p>
                </div>
              </footer>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
