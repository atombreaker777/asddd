import '../styles/globals.css';

export const metadata = {
  title: 'Mosoly Dental Chat',
  description: 'Professzionális fogorvosi recepciós chat felület',
};

/**
 * Root layout component.
 * This defines the HTML structure and wraps all pages in consistent styling.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body>
        {children}
      </body>
    </html>
  );
}
