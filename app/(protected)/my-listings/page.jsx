import Header from "@/app/components/Header";
import MobileNavigation from "@/app/components/MobileNavigation";
import MyListingsClient from "./MyListingsClient";

const MyListings = () => {
  return (
    <>
      <Header />
      <MobileNavigation />
      <MyListingsClient />
    </>
  );
};

export default MyListings;