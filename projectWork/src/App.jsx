import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MovieDetails from "./pages/Details";
import Reels from "./pages/Reels";
import Movies from "./pages/Movies";
import Tv from "./pages/Tv";
import MyList from "./pages/MyList";
import Settings from "./pages/Settings";
import GenreBrowse from "./pages/GenreBrowse";
import PersonPage from "./pages/PersonPage";
import AdvancedSearch from "./pages/AdvancedSearch";

function App() {
  const location = useLocation();
  const hideChrome = ["/login", "/signup", "/reels"].includes(location.pathname);

  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh", color: "white", fontFamily: "'Inter', sans-serif" }}>
      {!hideChrome && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:categoryKey" element={<Movies />} />
        <Route path="/tv" element={<Tv />} />
        <Route path="/genre" element={<GenreBrowse />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/mylist" element={<MyList />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<MovieDetails />} />
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="/search" element={<AdvancedSearch />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      {!hideChrome && <Footer />}
      <ScrollToTop />
    </div>
  );
}

export default App;