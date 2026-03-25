import { useState } from "react";
import type { AddressRecord } from "../types/app";

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

type AddressDraft = {
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
};

export function useAddressBook() {
  const [addresses, setAddresses] = useState<AddressRecord[]>(initialAddresses);

  const saveAddress = (editingAddressId: string | null, draft: AddressDraft, fallbackName: string) => {
    const normalizedDraft = {
      label: draft.label.trim() || "New Address",
      recipient: draft.recipient.trim() || fallbackName,
      phone: draft.phone.trim() || "(604) 555-0100",
      line1: draft.line1.trim(),
      line2: draft.line2?.trim() || "",
      city: draft.city.trim(),
      region: draft.region.trim(),
      postalCode: draft.postalCode.trim(),
    };

    if (!normalizedDraft.line1 || !normalizedDraft.city || !normalizedDraft.region) {
      return false;
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

    return true;
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

  return {
    addresses,
    saveAddress,
    removeAddress,
    setPrimaryAddress,
  };
}
