import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { AuthUser, Product } from "../types/app";

type ProfilePageProps = {
  user: AuthUser | null;
  cartItems: Array<Product & { quantity: number; subtotal: number }>;
  onIncreaseCartItem: (product: Product) => void;
  onDecreaseCartItem: (product: Product) => void;
  onRemoveCartItem: (product: Product) => void;
  onCartCheckout: () => void;
};

type AddressRecord = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  isPrimary: boolean;
};

type OrderStatus = "In cart" | "Paid" | "Shipped" | "Return requested";

type OrderRecord = {
  id: string;
  orderNumber: string;
  trackingNumber?: string;
  itemName: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  eta: string;
  detail: string;
  image: string;
};

const initialAddresses: AddressRecord[] = [
  {
    id: "addr-home",
    label: "Home",
    recipient: "Jessie Chen",
    phone: "(604) 555-0182",
    line1: "1988 Main Street",
    line2: "Unit 12",
    city: "Vancouver",
    region: "BC",
    postalCode: "V5T 3C2",
    isPrimary: true,
  },
  {
    id: "addr-studio",
    label: "Studio",
    recipient: "Jessie Chen",
    phone: "(604) 555-0117",
    line1: "49 Water Street",
    city: "Vancouver",
    region: "BC",
    postalCode: "V6B 1A1",
    isPrimary: false,
  },
];

const initialOrders: OrderRecord[] = [
  {
    id: "order-002",
    orderNumber: "PAID-24002",
    trackingNumber: "PKG-8Z41-2209",
    itemName: "Nezuko Dawn Mug",
    quantity: 1,
    total: 24,
    status: "Paid",
    eta: "Packing in 1 business day",
    detail: "Payment captured successfully. The warehouse team has queued this order for packing.",
    image: "/mug.png",
  },
  {
    id: "order-003",
    orderNumber: "SHIP-24003",
    trackingNumber: "TRK-BC24-90317",
    itemName: "Corps Canvas Carry",
    quantity: 1,
    total: 29,
    status: "Shipped",
    eta: "Arriving Mar 24",
    detail: "Tracking label created. The tote has already left the Vancouver dispatch hub.",
    image: "/bag.png",
  },
];

const emptyAddressDraft = {
  label: "",
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
};

export default function ProfilePage({
  user,
  cartItems,
  onIncreaseCartItem,
  onDecreaseCartItem,
  onRemoveCartItem,
  onCartCheckout,
}: ProfilePageProps) {
  const [displayName, setDisplayName] = useState(user?.name ?? "Guest Viewer");
  const [avatarUrl, setAvatarUrl] = useState("/693aebc11ce502fda14fda3648cbfb4d.png");
  const [isEditingName, setIsEditingName] = useState(false);
  const [addresses, setAddresses] = useState<AddressRecord[]>(initialAddresses);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState(emptyAddressDraft);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const primaryAddress =
    addresses.find((address) => address.isPrimary) ?? addresses[0] ?? null;
  const membershipLabel =
    user?.role === "member" || user?.role === "admin" ? "Member" : "Non-member";
  const membershipLevel = user?.role === "member" || user?.role === "admin" ? "Level 3" : "Level 0";
  const cartOrders: OrderRecord[] = cartItems.map((item) => ({
    id: `cart-${item.id}`,
    orderNumber: `CART-${item.id.replace("merch-", "").toUpperCase()}`,
    itemName: item.name,
    quantity: item.quantity,
    total: item.subtotal,
    status: "In cart",
    eta: "Ready in your shopping cart",
    detail: `${item.note} This item is still waiting in your cart.`,
    image: item.image,
  }));
  const orderRecords = [
    ...cartOrders,
    ...orders.map((order) => ({
      ...order,
      orderNumber:
        order.orderNumber || order.id.replace("order-", "ORDER-").toUpperCase(),
      trackingNumber:
        order.trackingNumber ||
        (order.status === "Paid"
          ? `PKG-${order.id.replace("order-", "").toUpperCase()}`
          : order.status === "Shipped"
            ? `TRK-${order.id.replace("order-", "").toUpperCase()}`
            : undefined),
    })),
  ];

  const openAddressModal = (address?: AddressRecord) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressDraft({
        label: address.label,
        recipient: address.recipient,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 ?? "",
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
      });
    } else {
      setEditingAddressId(null);
      setAddressDraft(emptyAddressDraft);
    }

    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressDraft(emptyAddressDraft);
  };

  const saveAddress = () => {
    const normalizedDraft = {
      label: addressDraft.label.trim() || "New Address",
      recipient: addressDraft.recipient.trim() || displayName,
      phone: addressDraft.phone.trim() || "(604) 555-0100",
      line1: addressDraft.line1.trim(),
      line2: addressDraft.line2.trim(),
      city: addressDraft.city.trim(),
      region: addressDraft.region.trim(),
      postalCode: addressDraft.postalCode.trim(),
    };

    if (!normalizedDraft.line1 || !normalizedDraft.city || !normalizedDraft.region) {
      return;
    }

    setAddresses((current) => {
      if (editingAddressId) {
        return current.map((address) =>
          address.id === editingAddressId
            ? {
                ...address,
                ...normalizedDraft,
              }
            : address,
        );
      }

      return [
        ...current,
        {
          id: `addr-${Date.now()}`,
          ...normalizedDraft,
          isPrimary: current.length === 0,
        },
      ];
    });

    closeAddressModal();
  };

  const removeAddress = (addressId: string) => {
    setAddresses((current) => {
      const remaining = current.filter((address) => address.id !== addressId);

      if (!remaining.some((address) => address.isPrimary) && remaining[0]) {
        remaining[0] = {
          ...remaining[0],
          isPrimary: true,
        };
      }

      return remaining;
    });
  };

  const setPrimaryAddress = (addressId: string) => {
    setAddresses((current) =>
      current.map((address) => ({
        ...address,
        isPrimary: address.id === addressId,
      })),
    );
  };

  const requestReturn = (orderId: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "Return requested",
              eta: "Return review started",
              detail:
                "Your return request has been recorded. A follow-up message will confirm next steps.",
            }
          : order,
      ),
    );
  };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextAvatarUrl = URL.createObjectURL(file);
    setAvatarUrl(nextAvatarUrl);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    setPasswordFeedback("");
  };

  const submitPasswordChange = () => {
    if (!currentPassword.trim() || !nextPassword.trim() || !confirmPassword.trim()) {
      setPasswordFeedback("Please complete all password fields.");
      return;
    }

    if (nextPassword !== confirmPassword) {
      setPasswordFeedback("The new passwords do not match.");
      return;
    }

    setPasswordFeedback("Password updated successfully.");
    window.setTimeout(() => {
      closePasswordModal();
    }, 900);
  };

  return (
    <div className="page-stack profile-page-stack">
      <section className="profile-dashboard-grid">
        <article className="glass-card profile-personal-card">
          <div className="profile-card-head">
            <div>
              <p className="card-kicker">Personal</p>
              <h3>{displayName}</h3>
              <p className="profile-membership-note">
                {membershipLabel} · {membershipLevel}
              </p>
            </div>
            <button
              className="profile-avatar-preview profile-avatar-button"
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Upload profile image"
            >
              <img src={avatarUrl} alt={displayName} />
            </button>
          </div>

          <div className="profile-personal-row">
            <div className="profile-name-edit">
              <span className="muted-copy">Name</span>
              {isEditingName ? (
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  placeholder="Display name"
                  autoFocus
                />
              ) : (
                <strong>{displayName}</strong>
              )}
              <button
                className="ghost-button profile-mini-button"
                type="button"
                onClick={() => setIsEditingName((current) => !current)}
                aria-label="Edit name"
              >
                <img src="/edit.png" alt="" />
              </button>
            </div>

            <div className="profile-profile-actions">
              <input
                ref={avatarInputRef}
                className="profile-hidden-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <button
                className="ghost-button"
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                Upgrade
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change password
              </button>
            </div>
          </div>
        </article>

        <article className="glass-card profile-address-card">
          <div className="profile-card-head">
            <div>
              <p className="card-kicker">Address</p>
              <h3>Primary shipping address</h3>
            </div>
            <button className="ghost-button" type="button" onClick={() => openAddressModal()}>
              Manage addresses
            </button>
          </div>

          {primaryAddress ? (
            <div className="profile-address-primary">
              <strong>
                {primaryAddress.recipient} · {primaryAddress.phone}
              </strong>
              <p>
                {primaryAddress.line1}
                {primaryAddress.line2 ? `, ${primaryAddress.line2}` : ""}
                {`, ${primaryAddress.city}, ${primaryAddress.region} ${primaryAddress.postalCode}`}
              </p>
            </div>
          ) : (
            <p className="muted-copy">No shipping address saved yet.</p>
          )}
        </article>
      </section>

      <section className="glass-card profile-orders-panel">
        <div className="profile-card-head">
          <div>
            <p className="card-kicker">Orders</p>
            <h3>Shopping status and actions</h3>
          </div>
        </div>

        <div className="profile-order-list">
          {orderRecords.map((order) => (
            <article key={order.id} className="profile-order-card">
              <div className="profile-order-topline">
                <div className="profile-order-summary">
                  <div className="profile-order-image">
                    <img src={order.image} alt={order.itemName} />
                  </div>
                  <div className="profile-order-copy">
                    <strong>{order.itemName}</strong>
                    <p>
                      Qty {order.quantity} · Total ${order.total}
                    </p>
                    <span>{order.eta}</span>
                    <span className="profile-order-number">
                      Order # {order.orderNumber || order.id.toUpperCase()}
                    </span>
                    {order.trackingNumber ? (
                      <span className="profile-order-tracking">
                        Tracking # {order.trackingNumber}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="profile-order-side">
                  <span
                    className={`profile-status-chip ${order.status.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {order.status}
                  </span>

                  <div className="profile-order-qty-controls">
                    {order.status === "In cart" ? (
                      <>
                        {(() => {
                          const cartProduct = cartItems.find((item) => `cart-${item.id}` === order.id);

                          if (!cartProduct) {
                            return null;
                          }

                          return (
                            <>
                              <button
                                className="profile-order-icon-button"
                                type="button"
                                onClick={() => onDecreaseCartItem(cartProduct)}
                                aria-label={`Decrease ${order.itemName}`}
                              >
                                -
                              </button>
                              <span className="profile-order-qty-value">{order.quantity}</span>
                              <button
                                className="profile-order-icon-button"
                                type="button"
                                onClick={() => onIncreaseCartItem(cartProduct)}
                                aria-label={`Increase ${order.itemName}`}
                              >
                                +
                              </button>
                              <button
                                className="profile-order-icon-button profile-order-remove-button"
                                type="button"
                                onClick={() => onRemoveCartItem(cartProduct)}
                                aria-label={`Remove ${order.itemName}`}
                              >
                                <img src="/bin.png" alt="" />
                              </button>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        <button
                          className="profile-order-icon-button"
                          type="button"
                          disabled
                          aria-hidden="true"
                        >
                          -
                        </button>
                        <span className="profile-order-qty-value">{order.quantity}</span>
                        <button
                          className="profile-order-icon-button"
                          type="button"
                          disabled
                          aria-hidden="true"
                        >
                          +
                        </button>
                        <button
                          className="profile-order-icon-button profile-order-remove-button"
                          type="button"
                          disabled
                          aria-hidden="true"
                        >
                          <img src="/bin.png" alt="" />
                        </button>
                      </>
                    )}
                  </div>

                  {order.status === "In cart" ? (
                    <button
                      className="primary-button profile-order-pay"
                      type="button"
                      onClick={onCartCheckout}
                    >
                      Pay
                    </button>
                  ) : (
                    <div className="profile-inline-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() =>
                          setExpandedOrderId((current) => (current === order.id ? null : order.id))
                        }
                      >
                        Details
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        disabled={order.status === "Return requested"}
                        onClick={() => requestReturn(order.id)}
                      >
                        Return
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {order.status !== "In cart" && expandedOrderId === order.id ? (
                <div className="profile-order-detail">
                  <p>{order.detail}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {isAddressModalOpen && (
        <div className="profile-address-modal-backdrop">
          <section className="glass-card profile-address-modal">
            <div className="profile-card-head">
              <div>
                <p className="card-kicker">Address book</p>
                <h3>{editingAddressId ? "Edit address" : "Manage shipping addresses"}</h3>
              </div>
              <button className="ghost-button" type="button" onClick={closeAddressModal}>
                Close
              </button>
            </div>

            <div className="profile-address-book">
              {addresses.map((address) => (
                <article key={address.id} className="profile-address-book-card">
                  <div>
                    <strong>{address.label}</strong>
                    <p>{address.recipient}</p>
                    <p>
                      {address.line1}, {address.city}
                    </p>
                  </div>
                  <div className="profile-inline-actions">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => setPrimaryAddress(address.id)}
                    >
                      {address.isPrimary ? "Primary" : "Set primary"}
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => openAddressModal(address)}
                    >
                      Edit
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => removeAddress(address.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="profile-field-grid">
              <label className="profile-field">
                <span>Label</span>
                <input
                  value={addressDraft.label}
                  onChange={(event) =>
                    setAddressDraft((current) => ({ ...current, label: event.target.value }))
                  }
                  placeholder="Home / Studio / Office"
                />
              </label>
              <label className="profile-field">
                <span>Recipient</span>
                <input
                  value={addressDraft.recipient}
                  onChange={(event) =>
                    setAddressDraft((current) => ({
                      ...current,
                      recipient: event.target.value,
                    }))
                  }
                  placeholder="Recipient name"
                />
              </label>
              <label className="profile-field">
                <span>Phone</span>
                <input
                  value={addressDraft.phone}
                  onChange={(event) =>
                    setAddressDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="Phone number"
                />
              </label>
              <label className="profile-field">
                <span>Address line 1</span>
                <input
                  value={addressDraft.line1}
                  onChange={(event) =>
                    setAddressDraft((current) => ({ ...current, line1: event.target.value }))
                  }
                  placeholder="Street address"
                />
              </label>
              <label className="profile-field">
                <span>Address line 2</span>
                <input
                  value={addressDraft.line2}
                  onChange={(event) =>
                    setAddressDraft((current) => ({ ...current, line2: event.target.value }))
                  }
                  placeholder="Apartment / unit"
                />
              </label>
              <label className="profile-field">
                <span>City</span>
                <input
                  value={addressDraft.city}
                  onChange={(event) =>
                    setAddressDraft((current) => ({ ...current, city: event.target.value }))
                  }
                  placeholder="City"
                />
              </label>
              <label className="profile-field">
                <span>Region</span>
                <input
                  value={addressDraft.region}
                  onChange={(event) =>
                    setAddressDraft((current) => ({ ...current, region: event.target.value }))
                  }
                  placeholder="Province / State"
                />
              </label>
              <label className="profile-field">
                <span>Postal code</span>
                <input
                  value={addressDraft.postalCode}
                  onChange={(event) =>
                    setAddressDraft((current) => ({
                      ...current,
                      postalCode: event.target.value,
                    }))
                  }
                  placeholder="Postal code"
                />
              </label>
            </div>

            <div className="profile-inline-actions">
              <button className="primary-button" type="button" onClick={saveAddress}>
                {editingAddressId ? "Save address" : "Add address"}
              </button>
              <button className="ghost-button" type="button" onClick={closeAddressModal}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="profile-address-modal-backdrop">
          <section className="glass-card profile-action-modal">
            <div className="profile-card-head">
              <div>
                <p className="card-kicker">Password</p>
                <h3>Change password</h3>
              </div>
              <button className="ghost-button" type="button" onClick={closePasswordModal}>
                Close
              </button>
            </div>

            <div className="profile-password-form">
              <label className="profile-field">
                <span>Current password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter current password"
                />
              </label>
              <label className="profile-field">
                <span>New password</span>
                <input
                  type="password"
                  value={nextPassword}
                  onChange={(event) => setNextPassword(event.target.value)}
                  placeholder="Enter a new password"
                />
              </label>
              <label className="profile-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm the new password"
                />
              </label>
            </div>

            {passwordFeedback ? <p className="profile-modal-note">{passwordFeedback}</p> : null}

            <div className="profile-inline-actions">
              <button className="primary-button" type="button" onClick={submitPasswordChange}>
                Save password
              </button>
              <button className="ghost-button" type="button" onClick={closePasswordModal}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {isUpgradeModalOpen && (
        <div className="profile-address-modal-backdrop">
          <section className="glass-card profile-action-modal profile-qr-modal">
            <div className="profile-qr-header">
              <div className="profile-qr-header-top">
                <p className="card-kicker">Upgrade</p>
                <button
                  className="ghost-button profile-qr-close"
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="profile-qr-heading">
                <h3>Scan to pay for member upgrade</h3>
              </div>
            </div>

            <div className="profile-qr-shell" aria-hidden="true">
              <div className="profile-qr-code">
                {Array.from({ length: 49 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
            </div>

            <div className="profile-modal-copy">
              <p>Member upgrade payment</p>
              <strong>$20/month or $200/year</strong>
              <span>Scan to upgrade. Monthly membership is $20, and the annual pass is $200.</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
