import CartIcon from "./CartIcon";
import Container from "./Container";
import FavouriteButton from "./FavouriteButton";
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import Signin from "./Signin";
import MobileMenu from "./MobileMenu";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-shop_dark_green/10 bg-white/90 backdrop-blur-md">
      <Container className="flex items-center justify-between py-3.5 text-lightColor sm:py-4">
        <div className="flex w-auto items-center justify-start gap-2.5 md:w-1/3 md:gap-0">
          <MobileMenu />
          <Logo />
        </div>
        <HeaderMenu />
        <div className="flex w-auto items-center justify-end gap-4 sm:gap-5 md:w-1/3">
          <SearchBar />
          <CartIcon />
          <FavouriteButton />
          <Signin />
        </div>
      </Container>
    </header>
  );
};

export default Header;
