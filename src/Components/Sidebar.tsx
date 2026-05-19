"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { GoChevronRight } from "react-icons/go";
import { HiBriefcase } from "react-icons/hi";
import { GoProjectRoadmap } from "react-icons/go";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import { BiNews } from "react-icons/bi";
import { RiContactsBook3Line } from "react-icons/ri";
import { RiTeamLine } from "react-icons/ri";

import TokenTimer from "@/Components/TokenTimer";

type HebentIcon = React.ElementType | StaticImageData;

type HebentMenuItem = {
  key: string;
  title: string;
  icon: HebentIcon;
  href?: string;
  links?: { href: string; label: string }[];
};

function isStaticImageData(icon: HebentIcon): icon is StaticImageData {
  return (
    typeof icon === "object" &&
    icon !== null &&
    "src" in icon &&
    typeof (icon as StaticImageData).src === "string"
  );
}

function MenuGroupIcon({ icon, label }: { icon: HebentIcon; label: string }) {
  if (isStaticImageData(icon)) {
    return (
      <Image
        src={icon}
        alt={label}
        width={22}
        height={22}
        className="shrink-0"
      />
    );
  }
  const Icon = icon;
  return <Icon className="size-[22px] shrink-0 text-gray-700" aria-hidden />;
}

const menuGroupsHebent: HebentMenuItem[] = [
  {
    key: "content-management",
    title: "Content Management",
    icon: MdOutlineSettingsSuggest,
    links: [{ href: "/admin/slider", label: "Services" }],
  },
  {
    key: "projects",
    title: "Projects",
    icon: GoProjectRoadmap,
    links: [
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/project-gallery", label: "Project Gallery" },
    ],
  },
  {
    key: "news",
    title: "News",
    icon: BiNews,
    links: [
      { href: "/admin/news", label: "News" },
      { href: "/admin/news-category", label: "News category" },
      { href: "/admin/news-gallery", label: "News gallery" },
    ],
  },
  {
    key: "contacts",
    title: "Contacts",
    icon: RiContactsBook3Line,
    links: [
      { href: "/admin/phone", label: "Phone numbers" },
      { href: "/admin/social-links", label: "Social links" },
      { href: "/admin/contact-responses", label: "Contact responses" },
    ],
  },
  {
    key: "vacancy",
    title: "Vacancy",
    icon: HiBriefcase,
    links: [
      { href: "/admin/vacancy", label: "Vacancy" },
      { href: "/admin/vacancy-responses", label: "Vacancy responses" },
    ],
  },
  {
    key: "about-us",
    title: "About Us",
    icon: RiTeamLine,
    links: [
      { href: "/admin/video", label: "Video" },
      { href: "/admin/statistics", label: "Statistics" },
      { href: "/admin/testimonials", label: "Testimonials" },
    ],
  },
  // {
  //   key: "privacy",
  //   title: "Privacy",
  //   icon: MdOutlinePrivacyTip,
  //   links: [{ href: "/admin/privacy", label: "Privacy" }],
  // },
  // {
  //   key: "cookies",
  //   title: "Cookies",
  //   icon: LuCookie,
  //   links: [{ href: "/admin/cookies", label: "Cookies" }],
  // },
  // {
  //   key: "faq",
  //   title: "FAQ",
  //   icon: FaQuestion,
  //   links: [{ href: "/admin/faq", label: "FAQ" }],
  // },
  // {
  //   key: "subscribe",
  //   title: "Subscribe",
  //   icon: subscribe,
  //   links: [{ href: "/admin/subscribe", label: "Subscribe" }],
  // },
];
function itemRoutes(item: HebentMenuItem): { href: string }[] {
  if (item.links?.length) return item.links;
  if (item.href) return [{ href: item.href }];
  return [];
}
const Sidebar = () => {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const newOpenGroups: { [key: string]: boolean } = {};
    for (const group of menuGroupsHebent) {
      const routes = itemRoutes(group);
      if (routes.some(({ href }) => pathname.startsWith(href))) {
        newOpenGroups[group.key] = true;
      }
    }
    setOpenGroups((prev) => ({ ...prev, ...newOpenGroups }));
  }, [pathname]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const rowBase =
    "w-full flex items-center justify-between gap-3 rounded-2xl px-2 py-4 text-left font-normal text-gray-900 transition-colors";

  return (
    <aside
      className="w-72 bg-sidebar-background shadow-md h-screen fixed z-10"
      aria-label="Sidebar"
    >
      <nav className="h-full px-2 py-4 overflow-y-auto flex flex-col gap-1">
        {menuGroupsHebent.map((item) => {
          const routes = itemRoutes(item);
          const onlyLink = item.links?.length === 1 ? item.links[0] : null;
          const sectionActive = routes.some(({ href }) => isActive(href));
          const expanded = Boolean(openGroups[item.key]);

          const directHref = item.href ?? onlyLink?.href;
          if (directHref) {
            return (
              <Link
                key={item.key}
                href={directHref}
                className={`${rowBase} hover:bg-white/50 ${
                  isActive(directHref) ? "bg-white/80 shadow-sm" : ""
                }`}
              >
                <span className="flex items-center gap-3 min-w-0 ">
                  <MenuGroupIcon icon={item.icon} label={item.title} />
                  <span className="truncate">{item.title}</span>
                </span>
                <GoChevronRight
                  className="size-5 text-[#A3C8FF] shrink-0 bg-white rounded-full p-1"
                  aria-hidden
                />
              </Link>
            );
          }

          return (
            <div key={item.key} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggleGroup(item.key)}
                className={`${rowBase} hover:bg-white/50 ${
                  sectionActive && expanded ? "bg-white/80 shadow-sm" : ""
                }`}
                aria-expanded={expanded}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <MenuGroupIcon icon={item.icon} label={item.title} />
                  <span className="truncate">{item.title}</span>
                </span>
                <GoChevronRight
                  className={`size-5 text-[#A3C8FF] shrink-0 transition-transform ${
                    expanded ? "rotate-90" : ""
                  }`}
                  aria-hidden
                />
              </button>

              {expanded && item.links && (
                <ul className="ml-3 mr-1 mb-1 rounded-xl bg-white/45 py-2 px-2 space-y-0.5">
                  {item.links.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`block rounded-lg px-3 py-2.5 text-sm ${
                          isActive(href)
                            ? "bg-[#A3C8FF]/35 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-white/70"
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        <div className="mt-auto">
          <TokenTimer />
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
