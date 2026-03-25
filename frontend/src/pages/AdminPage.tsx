import { useMemo, useState } from "react";
import type { AdminOrderRecord } from "../types/app";

type AdminPageProps = {
  orders: AdminOrderRecord[];
  onShipOrder: (orderId: string, trackingNumber: string) => Promise<unknown>;
  onRefundOrder: (orderId: string) => Promise<unknown>;
};

export default function AdminPage({ orders, onShipOrder, onRefundOrder }: AdminPageProps) {
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");

  const stats = useMemo(
    () => ({
      paid: orders.filter((order) => order.status === "Paid").length,
      returned: orders.filter((order) => order.status === "Return requested").length,
      shipped: orders.filter((order) => order.status === "Shipped").length,
      completed: orders.filter((order) => order.status === "Completed").length,
      refunded: orders.filter((order) => order.status === "Refunded").length,
    }),
    [orders],
  );

  const handleShip = async (orderId: string) => {
    const draft = trackingDrafts[orderId]?.trim();
    if (!draft) {
      setFeedback("Shipping code is required before shipping an order.");
      return;
    }

    try {
      await onShipOrder(orderId, draft);
      setTrackingDrafts((current) => ({ ...current, [orderId]: "" }));
      setFeedback("Order shipped successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to ship this order.");
    }
  };

  const handleRefund = async (orderId: string) => {
    try {
      await onRefundOrder(orderId);
      setFeedback("Refund completed successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to refund this order.");
    }
  };

  return (
    <div className="page-stack admin-page-stack">
      <section className="admin-grid admin-summary-grid">
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Orders</p>
          <h3>{orders.length} buyer order(s)</h3>
          <p className="muted-copy">Admin view now reads real order status from the backend.</p>
        </article>
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Paid</p>
          <h3>{stats.paid}</h3>
          <p className="muted-copy">Ready for fulfillment and tracking number assignment.</p>
        </article>
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Returns</p>
          <h3>{stats.returned}</h3>
          <p className="muted-copy">Buyer has submitted a return shipping code and is waiting for refund review.</p>
        </article>
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Shipped</p>
          <h3>{stats.shipped}</h3>
          <p className="muted-copy">Orders already in transit and waiting for buyer confirmation.</p>
        </article>
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Completed</p>
          <h3>{stats.completed}</h3>
          <p className="muted-copy">Delivered orders that are fully closed.</p>
        </article>
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Refunded</p>
          <h3>{stats.refunded}</h3>
          <p className="muted-copy">Returned orders that have already been refunded.</p>
        </article>
      </section>

      <section className="glass-card admin-orders-board">
        <div className="profile-card-head">
          <div>
            <p className="card-kicker">Admin orders</p>
            <h3>Buyer purchase information</h3>
          </div>
        </div>

        {feedback ? <p className="profile-modal-note">{feedback}</p> : null}

        <div className="admin-order-list">
          {orders.map((order) => (
            <article key={`${order.id}-${order.itemName}-${order.selectedSize ?? "default"}`} className="admin-order-card">
              <div className="admin-order-topline">
                <div>
                  <strong>{order.buyerName}</strong>
                  <p>{order.buyerEmail}</p>
                </div>
                <span className={`profile-status-chip ${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {order.status}
                </span>
              </div>

              <div className="admin-order-body">
                <div className="admin-order-copy">
                  <h4>{order.itemName}</h4>
                  <p>
                    Qty {order.quantity} · Total ${order.total}
                    {order.selectedSize ? ` · Size ${order.selectedSize}` : ""}
                  </p>
                  <span>Order # {order.orderNumber}</span>
                  <span>{order.addressSummary}</span>
                  {order.trackingNumber ? (
                    <span className="profile-order-tracking">Outbound code # {order.trackingNumber}</span>
                  ) : null}
                  {order.returnTrackingNumber ? (
                    <span className="profile-order-tracking">Return code # {order.returnTrackingNumber}</span>
                  ) : null}
                </div>

                <div className="admin-order-actions">
                  {order.status === "Paid" ? (
                    <>
                      <input
                        value={trackingDrafts[order.id] ?? ""}
                        onChange={(event) =>
                          setTrackingDrafts((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder="Enter shipping code"
                      />
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => void handleShip(order.id)}
                        disabled={!trackingDrafts[order.id]?.trim()}
                      >
                        Ship
                      </button>
                    </>
                  ) : null}

                  {order.status === "Return requested" ? (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => void handleRefund(order.id)}
                    >
                      Refund
                    </button>
                  ) : null}

                  {order.status === "Shipped" ? (
                    <p className="muted-copy admin-order-waiting">
                      Waiting for buyer-side receipt confirmation or return request.
                    </p>
                  ) : null}

                  {order.status === "Completed" ? (
                    <p className="muted-copy admin-order-waiting">
                      Order completed. No further admin action is available.
                    </p>
                  ) : null}

                  {order.status === "Refunded" ? (
                    <p className="muted-copy admin-order-waiting">
                      Refund finished. This order is fully closed.
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
