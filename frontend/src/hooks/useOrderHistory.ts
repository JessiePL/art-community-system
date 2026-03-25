import { useEffect, useState } from "react";
import { checkout, confirmReceipt, getAdminOrders, getMyOrders, refundOrder, requestReturn, shipOrder } from "../services/merch";
import type { AddressRecord, AdminOrderRecord, OrderRecord, Product, UserRole } from "../types/app";

type PurchasedItem = Product & {
  quantity: number;
  subtotal: number;
};

const replaceOrderGroup = (current: OrderRecord[], replacements: OrderRecord[]) => {
  if (replacements.length === 0) {
    return current;
  }

  const targetId = replacements[0].id;
  return [...replacements, ...current.filter((order) => order.id !== targetId)];
};

const replaceAdminOrderGroup = (current: AdminOrderRecord[], replacements: AdminOrderRecord[]) => {
  if (replacements.length === 0) {
    return current;
  }

  const targetId = replacements[0].id;
  return [...replacements, ...current.filter((order) => order.id !== targetId)];
};

export function useOrderHistory(token: string | null, role: UserRole) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrderRecord[]>([]);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setAdminOrders([]);
      return;
    }

    const loadOrders = () =>
      getMyOrders(token)
        .then((nextOrders) => setOrders(nextOrders))
        .catch(() => setOrders([]));

    const loadAdminOrders = () =>
      role === "admin"
        ? getAdminOrders(token)
            .then((nextOrders) => setAdminOrders(nextOrders))
            .catch(() => setAdminOrders([]))
        : Promise.resolve(setAdminOrders([]));

    void loadOrders();
    void loadAdminOrders();

    const timer = window.setInterval(() => {
      void loadOrders();
      void loadAdminOrders();
    }, 10000);

    return () => window.clearInterval(timer);
  }, [token, role]);

  const checkoutItems = async (items: PurchasedItem[], address: AddressRecord | null) => {
    if (!token) {
      throw new Error("Login is required before checkout.");
    }

    const response = await checkout({
      address: address
        ? {
            label: address.label,
            recipient: address.recipient,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            region: address.region,
            postalCode: address.postalCode,
          }
        : null,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
      })),
    }, token);

    setOrders((current) => [...response.orders, ...current]);
    return response;
  };

  const confirmOrderReceipt = async (orderId: string) => {
    if (!token) {
      throw new Error("Login is required before confirming receipt.");
    }

    const response = await confirmReceipt(orderId, token);
    setOrders((current) => replaceOrderGroup(current, response));
    return response;
  };

  const requestOrderReturn = async (orderId: string, returnTrackingNumber: string) => {
    if (!token) {
      throw new Error("Login is required before requesting a return.");
    }

    const response = await requestReturn(orderId, returnTrackingNumber, token);
    setOrders((current) => replaceOrderGroup(current, response));
    return response;
  };

  const shipAdminOrder = async (orderId: string, trackingNumber: string) => {
    if (!token) {
      throw new Error("Admin login is required before shipping an order.");
    }

    const response = await shipOrder(orderId, trackingNumber, token);
    setAdminOrders((current) => replaceAdminOrderGroup(current, response));
    return response;
  };

  const refundAdminOrder = async (orderId: string) => {
    if (!token) {
      throw new Error("Admin login is required before refunding an order.");
    }

    const response = await refundOrder(orderId, token);
    setAdminOrders((current) => replaceAdminOrderGroup(current, response));
    return response;
  };

  return {
    orders,
    adminOrders,
    checkoutItems,
    confirmReceipt: confirmOrderReceipt,
    requestReturn: requestOrderReturn,
    shipOrder: shipAdminOrder,
    refundOrder: refundAdminOrder,
  };
}
