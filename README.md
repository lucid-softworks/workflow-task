# `@lucid-softworks/workflow-task`

Typed tasks with schema-validated inputs and outputs.

```ts
import { stringSchema } from "@lucid-softworks/schema-primitives";
import { defineTask } from "@lucid-softworks/workflow-task";

const fetchUser = defineTask({
  id: "fetch-user",
  input: stringSchema(),
  output: stringSchema(),
  run: async (id, context) => {
    if (context.signal.aborted) throw new Error("Cancelled");
    return `User ${id}`;
  },
});
```
