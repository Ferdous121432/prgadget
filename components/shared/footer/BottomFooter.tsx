import Link from "next/link";
import React from "react";
import { FaFacebookF, FaTwitter, FaWhatsapp, FaYoutube } from "react-icons/fa";

export default function BottomFotter() {
  const socialLinks = [
    { href: "https://discord.com", icon: <FaWhatsapp /> },
    { href: "https://twitter.com", icon: <FaTwitter /> },
    { href: "https://youtube.com", icon: <FaYoutube /> },
    { href: "https://facebook.com", icon: <FaFacebookF /> },
  ];

  return (
    <footer className="  bg-slate-900 text-amber-300 ">
      <div className="container wrapper-footer mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <a
          href="https://firdous.pro"
          className="text-center text-sm font-light md:text-left"
          target="_blank"
          rel="noopener noreferrer">
          ©
          <span className="text-sm font-bold uppercase hover:text-slate-100">
            Ferdous
          </span>
          , 2025. All rights reserved
        </a>

        <div className="flex justify-center gap-4 md:justify-start">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 transition-colors duration-500 ease-in-out hover:text-white">
              {link.icon}
            </a>
          ))}
        </div>

        <a
          href="#privacy-policy"
          className="text-center text-sm font-light hover:underline md:text-right">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
