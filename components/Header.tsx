import CartIcon from "./CartIcon";
import Container from "./Container";
import FavouriteButton from "./FavouriteButton";
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import Signin from "./Signin";
import MobileMenu from "./MobileMenu";
import { auth } from "@/auth";

const Header = async () => {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-shop_dark_green/10 bg-white/90 backdrop-blur-md">
      <Container className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3.5 sm:gap-4 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <MobileMenu />
          <Logo />
        </div>

        <HeaderMenu />

        <div className="flex shrink-0 items-center justify-end gap-2.5 sm:gap-3">
          <SearchBar />
          <div className="hidden md:contents">
            <CartIcon />
            <FavouriteButton />
          </div>
          <Signin initialUser={session?.user ?? null} />
        </div>
      </Container>
    </header>
  );
};

export default Header;
