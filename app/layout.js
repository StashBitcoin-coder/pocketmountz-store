import './globals.css';

export const metadata = {
  title: 'PocketMountz',
  description: 'Fine art collectables, sealed on Bitcoin.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
