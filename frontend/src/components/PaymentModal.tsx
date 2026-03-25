import { useEffect, useState } from "react";
import type { AddressRecord } from "../types/app";

type PaymentModalProps = {
  isOpen: boolean;
  title: string;
  amount: number;
  detail: string;
  addresses: AddressRecord[];
  onConfirmPayment: (selectedAddressId: string | null) => Promise<void> | void;
  onClose: () => void;
};

export default function PaymentModal({
  isOpen,
  title,
  amount,
  detail,
  addresses,
  onConfirmPayment,
  onClose,
}: PaymentModalProps) {
  const defaultAddressId =
    addresses.find((address) => address.isPrimary)?.id ?? addresses[0]?.id ?? "";
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddressId);
  const [paymentStep, setPaymentStep] = useState<"pending" | "success">("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedAddressId(defaultAddressId);
      setPaymentStep("pending");
      setIsSubmitting(false);
      setPaymentError("");
    }
  }, [defaultAddressId, isOpen]);

  if (!isOpen) {
    return null;
  }

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ?? null;

  const handleConfirmPayment = async () => {
    if (isSubmitting || paymentStep === "success") {
      return;
    }

    if (addresses.length === 0) {
      setPaymentError("No shipping address found. Please add one in Profile before paying.");
      return;
    }

    setIsSubmitting(true);
    setPaymentError("");

    try {
      await onConfirmPayment(selectedAddressId || null);
      setPaymentStep("success");

      window.setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (error) {
      setIsSubmitting(false);
      setPaymentError(error instanceof Error ? error.message : "Payment recording failed.");
    }
  };

  const paymentNote =
    paymentStep === "success"
      ? "Inventory and order history were updated through the backend checkout flow."
      : "Open WeChat, Alipay, or another scanner app and scan this code to complete payment.";

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <section
        className="auth-modal glass-card payment-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Payment QR code"
      >
        <div className="auth-modal-header">
          <div>
            <p className="eyebrow">{paymentStep === "success" ? "Payment received" : "Scan to Pay"}</p>
            <h3>{paymentStep === "success" ? "Order confirmed" : title}</h3>
            <p className="muted-copy">
              {paymentStep === "success"
                ? "Your payment was recorded and the order was saved to MongoDB."
                : detail}
            </p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="payment-address-section">
          <div className="payment-address-header">
            <div>
              <strong>Choose shipping address</strong>
              <p>Select where this order should be delivered before you scan.</p>
            </div>
            <span>{addresses.length} saved</span>
          </div>

          {addresses.length > 0 ? (
            <div className="payment-address-picker">
              <label className="payment-address-field">
                <span>Saved addresses</span>
                <select
                  value={selectedAddressId}
                  onChange={(event) => setSelectedAddressId(event.target.value)}
                  disabled={paymentStep === "success"}
                >
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label}
                      {address.isPrimary ? " (Primary)" : ""}
                      {` - ${address.recipient}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="payment-address-empty">
              <strong>No shipping address yet</strong>
              <p>Add a shipping address in Profile before paying for this order.</p>
            </div>
          )}
        </div>

        <div className="payment-modal-body payment-modal-body-split">
          <div className="payment-qr-column payment-qr-column-split">
            <div className={paymentStep === "success" ? "payment-qr-frame payment-qr-frame-success" : "payment-qr-frame"}>
              {paymentStep === "success" ? (
                <div className="payment-success-panel">
                  <span className="payment-success-mark">✓</span>
                  <strong>Paid</strong>
                  <p>Your checkout has been recorded.</p>
                </div>
              ) : (
                <img src="/payment-qr.svg" alt="Payment QR code" />
              )}
            </div>
          </div>

          <div className="payment-side-column">
            <div className="payment-total-block payment-total-block-side">
              <span>Total due</span>
              <strong>${amount.toFixed(2)}</strong>
            </div>

            <div className="payment-summary-card payment-summary-card-address-single">
              {selectedAddress ? (
                <div className="payment-selected-address">
                  <span>Deliver to</span>
                  <strong>
                    {selectedAddress.label}
                    {selectedAddress.isPrimary ? " · Primary" : ""}
                  </strong>
                  <p>
                    {selectedAddress.recipient} · {selectedAddress.phone}
                  </p>
                  <p>
                    {selectedAddress.line1}
                    {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}
                    {`, ${selectedAddress.city}, ${selectedAddress.region} ${selectedAddress.postalCode}`}
                  </p>
                </div>
              ) : (
                <div className="payment-selected-address payment-selected-address-empty">
                  <span>Deliver to</span>
                  <p>Please add a saved address first.</p>
                </div>
              )}
            </div>

            <p className="payment-qr-note payment-qr-note-side">{paymentNote}</p>
            {paymentError ? <p className="payment-qr-note payment-qr-note-side">{paymentError}</p> : null}
          </div>
        </div>

        <div className="payment-action-row">
          <button
            className="primary-button"
            type="button"
            onClick={handleConfirmPayment}
            disabled={addresses.length === 0 || isSubmitting || paymentStep === "success"}
          >
            {paymentStep === "success"
              ? "Payment Recorded"
              : isSubmitting
                ? "Recording..."
                : "Confirm Payment"}
          </button>
          <button className="ghost-button" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
