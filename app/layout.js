import './globals.css';

export const metadata = {
  title: 'PocketMountz',
  description: 'Fine art collectables, sealed on Bitcoin.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('theme')==='light'){document.body.classList.add('lightmode');}}catch(e){}` }} />
        {children}
      </body>
    </html>
  );
}
