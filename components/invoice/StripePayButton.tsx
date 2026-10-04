"use client";

import {
  useState,
} from "react";

type StripePayButtonProps = {
  invoiceId: string;
  remainingBalance: number;
};

export default function StripePayButton({
  invoiceId,
  remainingBalance,
}: StripePayButtonProps) {
  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handlePay() {
    try {
      setError("");
      setIsLoading(true);

      const response =
        await fetch(
          `/api/invoices/${invoiceId}/stripe/checkout`,
          {
            method: "POST",
          },
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Could not create payment link.",
        );
      }

      if (!result.url) {
        throw new Error(
          "Stripe did not return a checkout URL.",
        );
      }

      window.location.href =
        result.url;
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Could not start payment.",
      );
      setIsLoading(false);
    }
  }

  if (remainingBalance <= 0) {
    return (
      <span className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
        Paid
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePay}
        disabled={isLoading}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Opening checkout..."
          : `Pay AED ${remainingBalance.toFixed(2)}`}
      </button>

      {error ? (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}