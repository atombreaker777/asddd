import './globals.css';

export const metadata = {
  title: 'Mosoly Dental Backend',
  description: 'API routes for Mosoly Dental digital receptionist'
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}