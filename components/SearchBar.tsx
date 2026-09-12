"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const SearchDialog = dynamic(() => import("@/components/SearchDialog"), {
  ssr: false,
});

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [mountedDialog, setMountedDialog] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setMountedDialog(true);
        setOpen((prev) => !prev);
      }
    };
    const handleOpenSearch = () => {
      setMountedDialog(true);
      setOpen(true);
    };
    document.addEventListener("keydown", handleShortcut);
    window.addEventListener("pharmaco:open-search", handleOpenSearch);
    return () => {
      document.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("pharmaco:open-search", handleOpenSearch);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMountedDialog(true);
          setOpen(true);
        }}
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-shop_light_bg text-lightColor transition-colors hover:border-shop_light_green/40 hover:text-shop_dark_green md:flex md:w-auto md:max-w-[11rem] md:justify-start md:gap-2 md:px-3 lg:max-w-[14rem]"
        aria-label="Search products"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden min-w-0 flex-1 truncate text-left text-sm md:inline">
          Search…
        </span>
        <kbd className="hidden rounded border border-black/10 bg-white px-1.5 py-0.5 text-[10px] font-medium lg:inline">
          Ctrl K
        </kbd>
      </button>

      {mountedDialog ? (
        <SearchDialog open={open} onOpenChange={setOpen} />
      ) : null}
    </>
  );
};

export default SearchBar;
