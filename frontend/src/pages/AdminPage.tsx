import { useMemo, useState } from "react";

type AdminOrderStatus = "Paid" | "Return requested" | "Returned" | "Shipped" | "Completed" | "Refunded";

type AdminOrder = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  itemName: string;
  quantity: number;
  total: number;
  status: AdminOrderStatus;
  orderNumber: string;
  trackingNumber?: string;
};

const initialAdminOrders: AdminOrder[] = [
  {
    id: "admin-order-001",
    buyerName: "Jessie Chen",
    buyerEmail: "test@test.com",
    itemName: "Hashira Signal Tee",
    quantity: 2,
    total: 76,
    status: "Paid",
    orderNumber: "ORD-24001",
  },
  {
    id: "admin-order-002",
    buyerName: "Mina Lee",
    buyerEmail: "mina@member.acs.com",
    itemName: "Nezuko Dawn Mug",
    quantity: 1,
    total: 24,
    status: "Return requested",
    orderNumber: "ORD-24002",
    trackingNumber: "PKG-8Z41-2209",
  },
  {
    id: "admin-order-003",
    buyerName: "Kai Wong",
    buyerEmail: "kai@member.acs.com",
    itemName: "Corps Canvas Carry",
    quantity: 1,
    total: 29,
    status: "Shipped",
    orderNumber: "ORD-24003",
    trackingNumber: "TRK-BC24-90317",
  },
  {
    id: "admin-order-004",
    buyerName: "Aiko Park",
    buyerEmail: "aiko@member.acs.com",
    itemName: "Hashira Signal Tee",
    quantity: 1,
    total: 38,
    status: "Completed",
    orderNumber: "ORD-24004",
    trackingNumber: "TRK-BC24-90452",
  },
  {
    id: "admin-order-005",
    buyerName: "Leo Zhang",
    buyerEmail: "leo@member.acs.com",
    itemName: "Nezuko Dawn Mug",
    quantity: 1,
    total: 24,
    status: "Refunded",
    orderNumber: "ORD-24005",
    trackingNumber: "PKG-8Z41-2217",
  },
];

export default function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(initialAdminOrders);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});

  const stats = useMemo(
    () => ({
      paid: orders.filter((order) => order.status === "Paid").length,
      returned: orders.filter((order) => order.status === "Return requested" || order.status === "Returned").length,
      shipped: orders.filter((order) => order.status === "Shipped").length,
      completed: orders.filter((order) => order.status === "Completed").length,
      refunded: orders.filter((order) => order.status === "Refunded").length,
    }),
    [orders],
  );

  const handleShip = (orderId: string) => {
    const draft = trackingDrafts[orderId]?.trim();

    if (!draft) {
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "Shipped",
              trackingNumber: draft,
            }
          : order,
      ),
    );
  };

  const handleRefund = (orderId: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "Refunded",
            }
          : order,
      ),
    );
  };

  return (
    <div className="page-stack admin-page-stack">
      <section className="admin-grid admin-summary-grid">
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Orders</p>
          <h3>{orders.length} buyer order(s)</h3>
          <p className="muted-copy">Admin view focuses on paid, shipped, returned, and completed orders.</p>
        </article>
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Paid</p>
          <h3>{stats.paid}</h3>
          <p className="muted-copy">Ready for fulfillment and tracking number assignment.</p>
        </article>
        <article className="glass-card admin-panel-card">
          <p className="card-kicker">Returned</p>
          <h3>{stats.returned}</h3>
          <p className="muted-copy">Returned orders waiting for refund handling.</p>
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

        <div className="admin-order-list">
          {orders.map((order) => (
            <article key={order.id} className="admin-order-card">
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
                  </p>
                  <span>Order # {order.orderNumber}</span>
                  {order.trackingNumber ? (
                    <span className="profile-order-tracking">Tracking # {order.trackingNumber}</span>
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
                        placeholder="Enter tracking number"
                      />
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => handleShip(order.id)}
                        disabled={!trackingDrafts[order.id]?.trim()}
                      >
                        Ship
                      </button>
                    </>
                  ) : null}

                  {order.status === "Return requested" || order.status === "Returned" ? (
                    <>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => handleRefund(order.id)}
                      >
                        Refund
                      </button>
                    </>
                  ) : null}

                  {order.status === "Shipped" ? (
                    <p className="muted-copy admin-order-waiting">
                      Waiting for buyer-side delivery confirmation.
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
