import Header from "./components/header/Header";
import MobileNavigation from "./components/MobileNavigation";
import Listings from "./components/Listings";

const Home = () => {
    return (
        <>
            <Header />
            <MobileNavigation />
            <main className="min-h-screen">
                <h1 className="sr-only">Swapify - Local Marketplace</h1>
                <Listings />
            </main>
        </>
    );
};

export default Home;