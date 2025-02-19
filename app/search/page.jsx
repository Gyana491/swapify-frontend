import Header from "../components/header/Header";
import MobileNavigation from "../components/MobileNavigation";
import SearchListingContainer from "../components/search/SearchListingContainer";

const SearchPage = async ({ searchParams }) => {
  const { q } = searchParams;
  
  return (
    <>
      <Header />
      <MobileNavigation />
      <SearchListingContainer initialQuery={q} />
    </>
  );
};

export default SearchPage;
