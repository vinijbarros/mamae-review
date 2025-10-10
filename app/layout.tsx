import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

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
  title: "Mamãe Review",
  description: "Plataforma de reviews de produtos para mamães gestantes e recentes",
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
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-primary font-poppins">
                    Mamãe Review
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            
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
        </ThemeProvider>
      </body>
    </html>
  );
}
