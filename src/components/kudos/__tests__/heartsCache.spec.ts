import { describe, it, expect, vi, beforeEach } from "vitest";
import { heartsCache, subscribe, set, get, reset } from "../hooks/heartsCache";

beforeEach(() => {
  reset();
});

describe("heartsCache", () => {
  it("notifies multiple subscribers for the same id on set()", () => {
    const a = vi.fn();
    const b = vi.fn();
    subscribe("k1", a);
    subscribe("k1", b);
    set("k1", { count: 3, hearted: true });
    expect(a).toHaveBeenCalledWith({ count: 3, hearted: true });
    expect(b).toHaveBeenCalledWith({ count: 3, hearted: true });
  });

  it("does NOT re-notify when the value is identical (referential stability)", () => {
    const spy = vi.fn();
    subscribe("k1", spy);
    set("k1", { count: 1, hearted: false });
    set("k1", { count: 1, hearted: false });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("stops notifying after unsubscribe", () => {
    const spy = vi.fn();
    const unsub = subscribe("k1", spy);
    set("k1", { count: 1, hearted: true });
    unsub();
    set("k1", { count: 2, hearted: true });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("returns the current stored value via get()", () => {
    set("k2", { count: 7, hearted: false });
    expect(get("k2")).toEqual({ count: 7, hearted: false });
    expect(get("k-missing")).toBeUndefined();
  });

  it("exposes the namespace object (back-compat)", () => {
    heartsCache.set("k3", { count: 1, hearted: true });
    expect(heartsCache.get("k3")).toEqual({ count: 1, hearted: true });
  });

  it("isolates listeners per kudo id", () => {
    const a = vi.fn();
    subscribe("k1", a);
    set("k2", { count: 99, hearted: true });
    expect(a).not.toHaveBeenCalled();
  });
});
