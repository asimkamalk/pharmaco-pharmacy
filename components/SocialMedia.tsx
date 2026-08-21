import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
}

const socialLink = [
  {
    title: "Facebook",
    href: "https://www.facebook.com/",
    icon: <FaFacebookF className="h-5 w-5" />,
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/",
    icon: <FaInstagram className="h-5 w-5" />,
  },
  {
    title: "TikTok",
    href: "https://www.tiktok.com/",
    icon: <FaTiktok className="h-5 w-5" />,
  },
  {
    title: "Twitter",
    href: "https://x.com/",
    icon: <FaXTwitter className="h-5 w-5" />,
  },
];

const SocialMedia = ({ className, iconClassName, tooltipClassName }: Props) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3.5", className)}>
        {socialLink.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger
              render={
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.title}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 hover:border-shop_light_green hover:text-black",
                    iconClassName,
                  )}
                />
              }
            >
              {item.icon}
            </TooltipTrigger>

            <TooltipContent
              className={cn(
                "bg-white font-semibold text-darkColor",
                tooltipClassName,
              )}
            >
              {item.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default SocialMedia;
