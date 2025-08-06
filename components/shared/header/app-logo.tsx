import { APP_LOGO, APP_Name } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function AppLogo() {
  return (
    <div>
      <Link
        href="/"
        className="flex-center rounded-2xl ml-4 dark:bg-slate-50 px-3 py-1">
        <Image
          src={APP_LOGO}
          alt={`${APP_Name} logo`}
          height={48}
          width={144}
          priority={true}
        />
        {/* <span className="hidden lg:block font-bold text-2xl ml-3">
              {APP_Name}
            </span> */}
      </Link>
    </div>
  );
}

export default AppLogo;
