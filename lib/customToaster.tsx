"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, CheckCircle, Info, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Custom toast functions with JSX content
export const jsxToasts = {
  // Success toast with custom JSX
  successWithIcon: ({
    title,
    message,
    href,
    hrefTitle,
  }: {
    title: string;
    message?: any;
    href?: string;
    hrefTitle?: string;
  }) => {
    toast(
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-500 dark:text-slate-50 flex-shrink-0" />
        <div>
          <p className="font-medium dark:text-slate-50 text-green-900">
            {title}
          </p>
          {message && <p className="text-sm text-green-700">{message}</p>}
        </div>
        {href && (
          <Link href={`${href}`} className="ml-auto">
            <Button className="button-primary">{hrefTitle || ""}</Button>
          </Link>
        )}
      </div>,
    );
  },

  // Error toast with custom JSX
  errorWithIcon: (title: string, message?: string) => {
    toast(
      <div className="flex items-center gap-3">
        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-red-900">{title}</p>
          {message && <p className="text-sm text-red-700">{message}</p>}
        </div>
      </div>,
    );
  },

  // Warning toast with custom JSX
  warningWithIcon: (title: string, message?: string) => {
    toast(
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-yellow-900">{title}</p>
          {message && <p className="text-sm text-yellow-700">{message}</p>}
        </div>
      </div>,
    );
  },

  // Info toast with custom JSX
  infoWithIcon: (title: string, message?: string) => {
    toast(
      <div className="flex items-center gap-3">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-900">{title}</p>
          {message && <p className="text-sm text-blue-700">{message}</p>}
        </div>
      </div>,
    );
  },

  // Complex notification with action buttons
  notification: (
    title: string,
    message: string,
    onAction?: () => void,
    actionText = "View",
  ) => {
    toast(
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-purple-900">{title}</p>
            <p className="text-sm text-purple-700">{message}</p>
          </div>
        </div>
        {onAction && (
          <div className="flex gap-2 pl-8">
            <button
              onClick={() => {
                onAction();
                toast.dismiss();
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors">
              {actionText}
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors">
              Dismiss
            </button>
          </div>
        )}
      </div>,
      { duration: 6000 },
    );
  },

  // Loading toast with spinner
  loadingWithSpinner: (message: string, id?: string) => {
    return toast(
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <p className="font-medium">{message}</p>
      </div>,
      {
        duration: Infinity,
        id: id || "loading",
      },
    );
  },

  // Progress toast with progress bar
  progress: (title: string, progress: number, id = "progress") => {
    toast(
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium">{title}</p>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}></div>
        </div>
      </div>,
      {
        duration: Infinity,
        id,
      },
    );
  },

  // Toast with image
  withImage: (title: string, message: string, imageUrl: string) => {
    toast(
      <div className="flex gap-3">
        <img
          src={imageUrl}
          alt=""
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>,
    );
  },

  // Toast with avatar and action
  withAvatar: (
    name: string,
    message: string,
    avatarUrl: string,
    onViewProfile?: () => void,
  ) => {
    toast(
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onViewProfile && (
          <button
            onClick={() => {
              onViewProfile();
              toast.dismiss();
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            View
          </button>
        )}
      </div>,
    );
  },

  // Custom form toast with input
  withInput: (
    title: string,
    placeholder: string,
    onSubmit: (value: string) => void,
  ) => {
    toast(
      <div className="space-y-3">
        <p className="font-medium">{title}</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value;
                if (value.trim()) {
                  onSubmit(value);
                  toast.dismiss();
                }
              }
            }}
          />
          <button
            onClick={(e) => {
              const input =
                e.currentTarget.parentElement?.querySelector("input");
              const value = input?.value;
              if (value?.trim()) {
                onSubmit(value);
                toast.dismiss();
              }
            }}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>,
      { duration: 10000 },
    );
  },
};
