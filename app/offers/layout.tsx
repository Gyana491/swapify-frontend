import MobileNavigation from '@/app/components/MobileNavigation';

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MobileNavigation />
    </>
  );
}
