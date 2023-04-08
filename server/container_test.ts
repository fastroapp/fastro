import { Data } from "../types.d.ts";
import { createContainer } from "./container.ts";
import { assertEquals } from "./deps.ts";

Deno.test("container set and get", () => {
  const container = createContainer(1);

  container.set("key1", "value1");
  assertEquals(container.get("key1"), "value1");

  container.delete("key1");
  assertEquals(container.get("key1"), null);

  container.set("key2", "value2", { isExpired: false });
  assertEquals(container.get("key2"), "value2");

  container.set("key3", "value3", { isExpired: true, expirySeconds: 1 });
  assertEquals(container.get("key3"), "value3");

  assertEquals(container.size(), 2);

  return new Promise((resolve) => {
    setTimeout(() => {
      assertEquals(container.get("key2"), "value2");
      assertEquals(container.get("key3"), null);
      container.clear();
      assertEquals(container.size(), 0);
      assertEquals(container.objects(), new Map<string, Data>());
      container.clearInterval();
      resolve();
    }, 2000);
  });
});
