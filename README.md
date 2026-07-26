# `@lucid-softworks/workflow-task`

Typed tasks with schema-validated inputs and outputs.

```ts
const fetchUser = defineTask({
  id: "fetch-user",
  input: stringSchema(),
  output: userSchema,
  run: (id, context) => api.getUser(id, { signal: context.signal }),
});
```
