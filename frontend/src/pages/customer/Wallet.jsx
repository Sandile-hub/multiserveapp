import {
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../../api/axios";

import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Clock3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CreditCard,
  Receipt,
  RefreshCcw,
} from "lucide-react";

import "../../styles/Wallet.css";

function Wallet() {
  const [wallet, setWallet] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  // ====================================
  // FETCH WALLET
  // ====================================

  const fetchWallet =
    async () => {
      try {
        setLoading(true);

        const res =
          await API.get(
            "/wallet"
          );

        setWallet(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  // ====================================
  // TOP UP WALLET
  // ====================================

  const handleTopUp =
    async () => {
      if (
        !amount ||
        Number(amount) <= 0
      ) {
        return alert(
          "Enter valid amount"
        );
      }

      try {
        setProcessing(true);

        await API.post(
          "/wallet/top-up",
          {
            amount,
          }
        );

        await fetchWallet();

        setAmount("");

        alert(
          "Wallet topped up successfully"
        );
      } catch (error) {
        console.log(error);

        alert(
          error?.response?.data
            ?.message ||
            "Top up failed"
        );
      } finally {
        setProcessing(false);
      }
    };

  // ====================================
  // TOTAL INCOME
  // ====================================

  const totalIncome = useMemo(() => {
    return (
      wallet?.transactions
        ?.filter(
          (trx) =>
            trx.type ===
            "credit"
        )
        ?.reduce(
          (acc, trx) =>
            acc +
            Number(trx.amount),
          0
        ) || 0
    );
  }, [wallet]);

  // ====================================
  // TOTAL SPENT
  // ====================================

  const totalSpent = useMemo(() => {
    return (
      wallet?.transactions
        ?.filter(
          (trx) =>
            trx.type ===
            "debit"
        )
        ?.reduce(
          (acc, trx) =>
            acc +
            Number(trx.amount),
          0
        ) || 0
    );
  }, [wallet]);

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="wallet-page">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="wallet-header">
        <div>
          <div className="wallet-badge">
            <Sparkles size={14} />
            MultiServe Wallet
          </div>

          <h1 className="wallet-title">
            Digital Wallet
          </h1>

          <p className="wallet-subtitle">
            Securely manage your
            balance, top-ups,
            cashback, and service
            payments.
          </p>
        </div>

        <button
          onClick={fetchWallet}
          className="wallet-refresh-btn"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      {/* ================================= */}
      {/* MAIN BALANCE CARD */}
      {/* ================================= */}

      <div className="wallet-main-card">
        <div className="wallet-main-overlay" />

        <div className="wallet-main-top">
          <div className="wallet-main-icon">
            <WalletIcon size={28} />
          </div>

          <div className="wallet-status">
            <ShieldCheck size={16} />
            Wallet Protected
          </div>
        </div>

        <div className="wallet-balance-section">
          <p className="wallet-balance-label">
            Available Balance
          </p>

<h1 className="wallet-balance">
  R{Number(wallet?.balance || 0).toFixed(2)}
</h1>

          <div className="wallet-extra-stats">
            <div className="wallet-stat">
              <Clock3 size={16} />

              <span>
                Pending:
                <strong>
                  {" "}
                  R
                  {Number(
                    wallet?.pending_balance ||
                      0
                  ).toFixed(2)}
                </strong>
              </span>
            </div>

            <div className="wallet-stat cashback">
              <TrendingUp size={16} />

              <span>
                Cashback:
                <strong>
                  {" "}
                  R
                  {Number(
                    wallet?.cashback ||
                      0
                  ).toFixed(2)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* STATS GRID */}
      {/* ================================= */}

      <div className="wallet-stats-grid">
        <div className="wallet-stat-card">
          <div className="wallet-stat-icon income">
            <ArrowDownCircle
              size={22}
            />
          </div>

          <div>
            <p className="wallet-stat-title">
              Total Credits
            </p>

<h3 className="wallet-stat-value">
  R{Number(totalIncome || 0).toFixed(2)}
</h3>
            
          </div>
        </div>

        <div className="wallet-stat-card">
          <div className="wallet-stat-icon expense">
            <ArrowUpCircle
              size={22}
            />
          </div>

          <div>
            <p className="wallet-stat-title">
              Total Spent
            </p>

<h3 className="wallet-stat-value">
  R{Number(totalSpent || 0).toFixed(2)}
</h3>
            
          </div>
        </div>

        <div className="wallet-stat-card">
          <div className="wallet-stat-icon transactions">
            <Receipt size={22} />
          </div>

          <div>
            <p className="wallet-stat-title">
              Transactions
            </p>

            <h3 className="wallet-stat-value">
              {
                wallet
                  ?.transactions
                  ?.length
              }
            </h3>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* TOP UP SECTION */}
      {/* ================================= */}

      <div className="wallet-topup-card">
        <div className="wallet-topup-left">
          <div className="wallet-topup-icon">
            <CreditCard size={24} />
          </div>

          <div>
            <h2>
              Add Money
            </h2>

            <p>
              Instantly top up your
              MultiServe wallet using
              Yoco secure payments.
            </p>
          </div>
        </div>

        <div className="wallet-topup-right">
          <div className="wallet-input-wrapper">
            <span className="wallet-currency">
              R
            </span>

            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              className="wallet-input"
            />
          </div>

          <button
            onClick={handleTopUp}
            disabled={processing}
            className="wallet-topup-btn"
          >
            <Plus size={18} />

            {processing
              ? "Processing..."
              : "Top Up"}
          </button>
        </div>
      </div>

      {/* ================================= */}
      {/* TRANSACTIONS */}
      {/* ================================= */}

      <div className="wallet-transactions-card">
        <div className="wallet-transactions-header">
          <div>
            <h2>
              Recent Transactions
            </h2>

            <p>
              Your latest wallet
              activity
            </p>
          </div>
        </div>

        <div className="wallet-transactions-list">
          {loading ? (
            <div className="wallet-empty">
              Loading wallet...
            </div>
          ) : wallet?.transactions
              ?.length > 0 ? (
            wallet.transactions.map(
              (trx) => (
                <div
                  key={trx.id}
                  className="wallet-transaction-item"
                >
                  <div className="wallet-transaction-left">
                    <div
                      className={`wallet-transaction-icon ${
                        trx.type ===
                        "credit"
                          ? "credit"
                          : "debit"
                      }`}
                    >
                      {trx.type ===
                      "credit" ? (
                        <ArrowDownCircle
                          size={20}
                        />
                      ) : (
                        <ArrowUpCircle
                          size={20}
                        />
                      )}
                    </div>

                    <div>
                      <h4>
                        {
                          trx.description
                        }
                      </h4>

                      <p>
                        {trx.created_at
                          ? new Date(
                              trx.created_at
                            ).toLocaleString()
                          : "Recent"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`wallet-transaction-amount ${
                      trx.type ===
                      "credit"
                        ? "credit"
                        : "debit"
                    }`}
                  >
                    {trx.type ===
                    "credit"
                      ? "+"
                      : "-"}
                    R
                    {Number(
                      trx.amount
                    ).toFixed(2)}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="wallet-empty">
              <WalletIcon
                size={42}
              />

              <h3>
                No transactions yet
              </h3>

              <p>
                Your wallet activity
                will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wallet;