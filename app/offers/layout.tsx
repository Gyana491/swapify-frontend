import Header from '@/app/components/header/Header';
import MobileNavigation from '@/app/components/MobileNavigation';

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <MobileNavigation />
    </>
  );
}
