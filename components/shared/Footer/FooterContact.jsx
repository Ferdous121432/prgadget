import React from "react";

import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function FooterContact() {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="text-left font-bold uppercase tracking ">
          CONTACT INFO
        </h1>
      </div>
      <div className="flex flex-col gap-2 text-left ">
        <p>234 Street Name, City Name, United States</p>
        <p>Phone: +123 456 7890</p>
        <p>
          <Link href="#" className=" ">
            hello@picky.com
          </Link>
        </p>
      </div>
      <div className="flex gap-x-2 pt-1">
        <Link href="#" target="_blank">
          <FaFacebook className=" " />
        </Link>
        <Link href="#" target="_blank">
          <FaInstagram className=" " />
        </Link>
        <Link href="#" target="_blank">
          <FaTwitter className=" " />
        </Link>
        <Link href="#" target="_blank">
          <FaLinkedin className=" " />
        </Link>
      </div>
    </div>
  );
}
