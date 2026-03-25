import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { AddressRecord, AuthUser, OrderRecord, Product } from "../types/app";

type ProfilePageProps = {
  user: AuthUser | null;
  addresses: AddressRecord[];
  orders: OrderRecord[];
  cartItems: Array<Product & { quantity: number; subtotal: number }>;
  onIncreaseCartItem: (product: Product) => void;
  onDecreaseCartItem: (product: Product) => void;
  onRemoveCartItem: (product: Product) => void;
  onCartCheckout: () => void;
  onSaveAddress: (editingAddressId: string | null, draft: {
    label: string;
    recipient: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
  }, fallbackName: string) => Promise<boolean>;
  onRemoveAddress: (addressId: string) => Promise<void>;
  onSetPrimaryAddress: (addressId: string) => Promise<void>;
  onRequestReturn: (orderId: string, returnTrackingNumber: string) => Promise<unknown>;
  onConfirmReceipt: (orderId: string) => Promise<unknown>;
  onSaveProfile: (name: string, avatarUrl: string) => Promise<AuthUser>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<{ message: string }>;
};

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

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });

export default function ProfilePage({
  user,
  addresses,
  orders,
  cartItems,
  onIncreaseCartItem,
  onDecreaseCartItem,
  onRemoveCartItem,
  onCartCheckout,
  onSaveAddress,
  onRemoveAddress,
  onSetPrimaryAddress,
  onRequestReturn,
  onConfirmReceipt,
  onSaveProfile,
  onChangePassword,
}: ProfilePageProps) {
  const [displayName, setDisplayName] = useState(user?.name ?? "Guest Viewer");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "/693aebc11ce502fda14fda3648cbfb4d.png");
  const [isEditingName, setIsEditingName] = useState(false);
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
  const [profileFeedback, setProfileFeedback] = useState("");
  const [returnDrafts, setReturnDrafts] = useState<Record<string, string>>({});
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDisplayName(user?.name ?? "Guest Viewer");
    setAvatarUrl(user?.avatarUrl ?? "/693aebc11ce502fda14fda3648cbfb4d.png");
  }, [user?.avatarUrl, user?.name]);

  const primaryAddress =
    addresses.find((address) => address.isPrimary) ?? addresses[0] ?? null;
  const membershipLabel =
    user?.isMember ? "Member" : "Non-member";
  const membershipLevel = user?.isMember ? `Level ${user.membershipLevel || 1}` : "Level 0";
  const cartOrders: OrderRecord[] = cartItems.map((item) => ({
    id: `cart-${item.id}-${item.selectedSize ?? "default"}`,
    orderNumber: `CART-${item.id.toUpperCase()}${item.selectedSize ? `-${item.selectedSize}` : ""}`,
    itemName: item.name,
    quantity: item.quantity,
    total: item.subtotal,
    status: "In cart",
    eta: "Ready in your shopping cart",
    detail: `${item.note}${item.selectedSize ? ` Selected size: ${item.selectedSize}.` : ""} This item is still waiting in your cart.`,
    image: item.image,
    selectedSize: item.selectedSize,
  }));
  const orderRecords = [...cartOrders, ...orders];

  const buildOrderDetail = (order: OrderRecord) => {
    if (order.status !== "Completed") {
      return order.detail;
    }

    const normalizedDetail = order.detail.startsWith("Shipping to ")
      ? `Delivered to ${order.detail.slice("Shipping to ".length)}`
      : order.detail;

    const receiptLine = order.trackingNumber
      ? ` Buyer confirmed receipt. Outbound code # ${order.trackingNumber}.`
      : " Buyer confirmed receipt and this order is fully completed.";

    return `${normalizedDetail}${receiptLine}`;
  };

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

    setProfileFeedback("");
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressDraft(emptyAddressDraft);
  };

  const saveAddress = async () => {
    try {
      const didSave = await onSaveAddress(editingAddressId, addressDraft, displayName);
      if (!didSave) {
        setProfileFeedback("Address line 1, city, and region are required.");
        return;
      }

      setProfileFeedback(editingAddressId ? "Address updated successfully." : "Address added successfully.");
      closeAddressModal();
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "Unable to save this address.");
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const nextAvatarUrl = await readFileAsDataUrl(file);
      setAvatarUrl(nextAvatarUrl);
      setProfileFeedback("Avatar updated locally. Save profile to persist it.");
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "Unable to read this image.");
    }
  };

  const saveProfile = async () => {
    try {
      const nextUser = await onSaveProfile(displayName, avatarUrl);
      setDisplayName(nextUser.name);
      setAvatarUrl(nextUser.avatarUrl);
      setIsEditingName(false);
      setProfileFeedback("Profile updated successfully.");
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "Unable to update your profile.");
    }
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    setPasswordFeedback("");
  };

  const submitPasswordChange = async () => {
    if (!currentPassword.trim() || !nextPassword.trim() || !confirmPassword.trim()) {
      setPasswordFeedback("Please complete all password fields.");
      return;
    }

    if (nextPassword !== confirmPassword) {
      setPasswordFeedback("The new passwords do not match.");
      return;
    }

    try {
      const response = await onChangePassword(currentPassword, nextPassword);
      setPasswordFeedback(response.message);
      window.setTimeout(() => {
        closePasswordModal();
      }, 900);
    } catch (error) {
      setPasswordFeedback(error instanceof Error ? error.message : "Unable to update password.");
    }
  };

  const handleConfirmReceipt = async (orderId: string) => {
    try {
      await onConfirmReceipt(orderId);
      setProfileFeedback("Receipt confirmed successfully.");
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "Unable to confirm receipt.");
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    const draft = returnDrafts[orderId]?.trim();
    if (!draft) {
      setProfileFeedback("Return shipping code is required before requesting a return.");
      return;
    }

    try {
      await onRequestReturn(orderId, draft);
      setReturnDrafts((current) => ({ ...current, [orderId]: "" }));
      setProfileFeedback("Return request submitted successfully.");
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "Unable to request a return.");
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    try {
      await onRemoveAddress(addressId);
      setProfileFeedback("Address removed successfully.");
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "Unable to remove this address.");
    }
  };

  const handleSetPrimaryAddress = async (addressId: string) => {
    try {
      await onSetPrimaryAddress(addressId);
      setProfileFeedback("Primary address updated successfully.");
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "Unable to update the primary address.");
    }
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
                onChange={(event) => void handleAvatarUpload(event)}
              />
              <button className="ghost-button" type="button" onClick={() => void saveProfile()}>
                Save profile
              </button>
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

      {profileFeedback ? <p className="profile-modal-note">{profileFeedback}</p> : null}

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
                      {order.selectedSize ? ` · Size ${order.selectedSize}` : ""}
                    </p>
                    <span>{order.eta}</span>
                    <span className="profile-order-number">
                      Order # {order.orderNumber}
                    </span>
                    {order.trackingNumber ? (
                      <span className="profile-order-tracking">
                        Outbound code # {order.trackingNumber}
                      </span>
                    ) : null}
                    {order.returnTrackingNumber ? (
                      <span className="profile-order-tracking">
                        Return code # {order.returnTrackingNumber}
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
                          const cartProduct = cartItems.find(
                            (item) => `cart-${item.id}-${item.selectedSize ?? "default"}` === order.id,
                          );

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
                        <button className="profile-order-icon-button" type="button" disabled aria-hidden="true">
                          -
                        </button>
                        <span className="profile-order-qty-value">{order.quantity}</span>
                        <button className="profile-order-icon-button" type="button" disabled aria-hidden="true">
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
                    <button className="primary-button profile-order-pay" type="button" onClick={onCartCheckout}>
                      Pay
                    </button>
                  ) : (
                    <div className="profile-inline-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                      >
                        Details
                      </button>
                      {order.status === "Shipped" ? (
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => void handleConfirmReceipt(order.id)}
                        >
                          Confirm receipt
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {order.status === "Shipped" ? (
                <div className="profile-inline-actions" style={{ marginTop: 12 }}>
                  <input
                    value={returnDrafts[order.id] ?? ""}
                    onChange={(event) =>
                      setReturnDrafts((current) => ({
                        ...current,
                        [order.id]: event.target.value,
                      }))
                    }
                    placeholder="Enter return shipping code"
                  />
                  <button className="ghost-button" type="button" onClick={() => void handleRequestReturn(order.id)}>
                    Request return
                  </button>
                </div>
              ) : null}

              {order.status !== "In cart" && expandedOrderId === order.id ? (
                <div className="profile-order-detail">
                  <p>{buildOrderDetail(order)}</p>
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
                    <button className="ghost-button" type="button" onClick={() => void handleSetPrimaryAddress(address.id)}>
                      {address.isPrimary ? "Primary" : "Set primary"}
                    </button>
                    <button className="ghost-button" type="button" onClick={() => openAddressModal(address)}>
                      Edit
                    </button>
                    <button className="ghost-button" type="button" onClick={() => void handleRemoveAddress(address.id)}>
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
              <button className="primary-button" type="button" onClick={() => void saveAddress()}>
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
              <button className="primary-button" type="button" onClick={() => void submitPasswordChange()}>
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
