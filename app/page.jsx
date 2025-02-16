import Header from "./components/header/Header";
import MobileNavigation from "./components/MobileNavigation";
import Listings from "./components/Listings";

const Home = () => {
    return (
        <>
            <Header />
            <MobileNavigation />
            <Listings />
        </>
    );
};

export default Home;