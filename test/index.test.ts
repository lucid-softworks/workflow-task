import { numberSchema, stringSchema } from "@lucid-softworks/schema-primitives";
import { describe, expect, expectTypeOf, it } from "vitest";

import { defineTask, executeTask } from "../src/index.js";

const context = {
  attempt: 1,
  executionId: "run-1",
  results: new Map<string, unknown>(),
  signal: new AbortController().signal,
  taskId: "length",
};

describe("workflow tasks", () => {
  it("defines and executes schema-validated typed tasks", async () => {
    const task = defineTask({
      id: "length",
      input: stringSchema(),
      output: numberSchema(),
      run: (value) => value.length,
    });
    const output = await executeTask(task, "abc", context);
    expect(output).toBe(3);
    expectTypeOf(output).toEqualTypeOf<number>();
  });

  it("validates input and output", async () => {
    const task = defineTask({
      id: "bad-output",
      input: stringSchema(),
      output: numberSchema(),
      run: () => "wrong" as never,
    });
    await expect(executeTask(task, 1, context)).rejects.toThrow(
      "Expected string",
    );
    await expect(executeTask(task, "ok", context)).rejects.toThrow(
      "Expected number",
    );
  });

  it("rejects empty ids and cancellation before or after execution", async () => {
    expect(() =>
      defineTask({
        id: "",
        input: stringSchema(),
        output: stringSchema(),
        run: (value) => value,
      }),
    ).toThrow("Task id cannot be empty");
    const controller = new AbortController();
    controller.abort();
    await expect(
      executeTask(
        defineTask({
          id: "cancelled",
          input: stringSchema(),
          output: stringSchema(),
          run: (value) => value,
        }),
        "x",
        { ...context, signal: controller.signal },
      ),
    ).rejects.toThrow("cancelled");
    const during = new AbortController();
    await expect(
      executeTask(
        defineTask({
          id: "during",
          input: stringSchema(),
          output: stringSchema(),
          run(value) {
            during.abort();
            return value;
          },
        }),
        "x",
        { ...context, signal: during.signal },
      ),
    ).rejects.toThrow("cancelled");
  });
});
