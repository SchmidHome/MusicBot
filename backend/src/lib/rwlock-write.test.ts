// import { describe, it, expect } from "vitest";
import { RWLockWritePreferring } from "./rwlock-write";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// describe("rwlock-write", () => {
//   it("should pass", () => {
const mutex = new RWLockWritePreferring();
mutex.withRead(async () => {
  // expect(mutex.readerCount).toBeGreaterThan(0);
  // expect(mutex.writerCount).toBe(0);
  console.log("read1 start");
  await delay(100);
  console.log("read1 end");
  // expect(mutex.readerCount).toBeGreaterThan(0);
  // expect(mutex.writerCount).toBe(0);
});
mutex.withRead(async () => {
  // expect(mutex.readerCount).toBeGreaterThan(0);
  // expect(mutex.writerCount).toBe(0);
  console.log("read2 start");
  await delay(100);
  console.log("read2 end");
  // expect(mutex.readerCount).toBeGreaterThan(0);
  // expect(mutex.writerCount).toBe(0);
});
mutex.withWrite(async () => {
  // expect(mutex.readerCount).toBe(0);
  // expect(mutex.writerCount).toBe(1);
  console.log("write1 start");
  await delay(100);
  console.log("write1 end");
  // expect(mutex.readerCount).toBe(0);
  // expect(mutex.writerCount).toBe(1);
});
mutex.withWrite(async () => {
  // expect(mutex.readerCount).toBe(0);
  // expect(mutex.writerCount).toBe(1);
  console.log("write2 start");
  await delay(100);
  console.log("write2 end");
  // expect(mutex.readerCount).toBe(0);
  // expect(mutex.writerCount).toBe(1);
});
mutex.withWrite(async () => {
  // expect(mutex.readerCount).toBe(0);
  // expect(mutex.writerCount).toBe(1);
  console.log("write3 start");
  await delay(100);
  console.log("write3 end");
  // expect(mutex.readerCount).toBe(0);
  // expect(mutex.writerCount).toBe(1);
});
mutex.withWrite(async () => {
  // expect(mutex.readerCount).toBe(0);
  // expect(mutex.writerCount).toBe(1);
  console.log("write4 start");
  await delay(100);
  console.log("write4 end");
  // expect(mutex.readerCount).toBe(0);
  // expect(mutex.writerCount).toBe(1);
});
mutex.withRead(async () => {
  // expect(mutex.readerCount).toBeGreaterThan(0);
  // expect(mutex.writerCount).toBe(0);
  console.log("read3 start");
  await delay(100);
  console.log("read3 end");
});

mutex.withRead(async () => {
  // expect(mutex.readerCount).toBeGreaterThan(0);
  // expect(mutex.writerCount).toBe(0);
  console.log("read4 start");
  await delay(100);
  console.log("read4 end");
});
// expect(mutex.readerCount).toBeGreaterThan(0);
// expect(mutex.writerCount).toBe(0);
//     });
//   });
// });
