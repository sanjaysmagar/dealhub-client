import './globals.css';
import StoreProvider from './StoreProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: "DealHub — UK's Best Deals Community",
  description: 'Find the best deals, share affiliate links, and earn rewards.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}