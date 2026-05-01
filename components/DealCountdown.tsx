"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
// import AppLogo from "./shared/header/AppLogo";

const getNextDealDate = () => {
  const now = new Date();
  const currentMonthDeal = new Date(
    now.getFullYear(),
    now.getMonth(),
    20,
    23,
    59,
    59,
  );

  if (currentMonthDeal.getTime() > now.getTime()) {
    return currentMonthDeal;
  }

  return new Date(now.getFullYear(), now.getMonth() + 1, 20, 23, 59, 59);
};

// Function to calculate the time remaining
const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date();
  const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);
  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    ),
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
  };
};

const DealCountdown = () => {
  const [targetDate] = useState(getNextDealDate);
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();

  useEffect(() => {
    setTime(calculateTimeRemaining(targetDate));

    const timerInterval = setInterval(() => {
      const newTime = calculateTimeRemaining(targetDate);
      setTime(newTime);

      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [targetDate]);

  if (!time) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
        <div className="flex min-h-52 flex-col justify-center gap-2">
          <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
            Loading this month&apos;s deal...
          </h3>
        </div>
      </section>
    );
  }

  if (
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0
  ) {
    return (
      <section className="grid grid-cols-1 gap-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr] md:items-center sm:p-8">
        <div className="flex flex-col gap-3 justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
            Monthly promotion
          </p>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
            That deal has wrapped.
          </h3>
          <p className="text-sm leading-6 text-slate-600">
            This deal is no longer available. Check out our latest promotions!
          </p>

          <div>
            <Button asChild>
              <Link href="/search">View Products</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <Image
            src="/images/promo.jpg"
            alt="promotion"
            width={320}
            height={220}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 320px"
            className="rounded-3xl object-cover"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-8 rounded-[28px] border-0 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_55%,#0f766e_100%)] p-6 text-white shadow-sm md:grid-cols-[1.15fr_0.85fr] md:items-center sm:p-8">
      <div className="flex flex-col gap-4 justify-center">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/80">
            Deal of the month
          </p>
          <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Time-boxed offers keep the storefront moving.
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-7 text-slate-200">
          Get ready for a shopping experience like never before with our Deals
          of the Month! Every purchase comes with exclusive perks and offers,
          making this month a celebration of savvy choices and amazing deals.
          Don&apos;t miss out.
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Days" value={time.days} />
          <StatBox label="Hours" value={time.hours} />
          <StatBox label="Minutes" value={time.minutes} />
          <StatBox label="Seconds" value={time.seconds} />
        </ul>
        <div>
          <Button
            asChild
            className="bg-white text-slate-950 hover:bg-slate-100">
            <Link href="/search">View Products</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center md:justify-end">
        <Image
          src="/images/promo.jpg"
          alt="promotion"
          width={360}
          height={280}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 360px"
          className="rounded-3xl object-cover shadow-2xl"
        />
      </div>
    </section>
  );
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <li className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur">
    <p className="text-3xl font-semibold">{value}</p>
    <p className="mt-1 text-sm text-slate-200">{label}</p>
  </li>
);

export default DealCountdown;
