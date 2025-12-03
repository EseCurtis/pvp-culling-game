"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  amount: number;
  price: number;
  provider: string;
  status: string;
  createdAt: string;
};

type TransactionHistoryProps = {
  userId: string;
};

export function TransactionHistory({  }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const response = await fetch(`/api/payment/transactions?page=${page}`);
        const data = await response.json();
        if (response.ok) {
          setTransactions(data.transactions || []);
          setHasMore(data.hasMore || false);
        }
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [page]);

  if (loading && transactions.length === 0) {
    return null;
  }

  if (transactions.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-black/50 p-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <p className="mt-4 py-6 text-sm text-white/40">
          No transactions yet. Purchase XP to see your payment history here.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-black/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <span className="text-xs uppercase tracking-[0.3em] text-white/30">
          Payment records
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-4"
          >
            <div>
              <p className="text-sm font-semibold">
                {transaction.amount} XP
              </p>
              <p className="text-xs text-white/40 mt-1">
                {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                ${transaction.price.toFixed(2)}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                  {transaction.provider}
                </span>
                <span
                  className={`text-xs uppercase tracking-[0.2em] ${
                    transaction.status === "COMPLETED"
                      ? "text-green-400"
                      : transaction.status === "PENDING"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}

