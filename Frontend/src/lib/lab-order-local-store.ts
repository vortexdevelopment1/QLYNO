"use client";

import { LabOrder } from "@/lib/types";

const LAB_ORDER_STORAGE_KEY = "qlyno-local-lab-orders";

export function readLocalLabOrders(): LabOrder[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LAB_ORDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LabOrder[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalLabOrder(order: LabOrder) {
  if (typeof window === "undefined") return;

  const orders = readLocalLabOrders();
  const next = [order, ...orders.filter((item) => item.id !== order.id)];
  window.localStorage.setItem(LAB_ORDER_STORAGE_KEY, JSON.stringify(next));
}

export function mergeLocalLabOrders(orders: LabOrder[]) {
  const localOrders = readLocalLabOrders();
  const ids = new Set(orders.map((order) => order.id));
  return [...localOrders.filter((order) => !ids.has(order.id)), ...orders];
}
