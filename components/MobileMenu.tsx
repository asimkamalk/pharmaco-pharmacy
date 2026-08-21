"use client";

import { AlignLeft } from "lucide-react";
import SideMenu from "./SideMenu";
import { useState } from "react";

const MobileMenu = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsSideBarOpen(!isSideBarOpen)}
        aria-label="Open menu"
        aria-expanded={isSideBarOpen}
        className="md:hidden"
      >
        <AlignLeft className="hover:text-darkColor hover:cursor-pointer" />
      </button>
      <div className="md:hidden">
        <SideMenu
          isOpen={isSideBarOpen}
          onClose={() => setIsSideBarOpen(false)}
        />
      </div>
    </>
  );
};
export default MobileMenu;
