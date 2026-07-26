import { type InferOutput, type Schema } from "@lucid-softworks/schema-core";
import {
  throwIfWorkflowCancelled,
  type WorkflowExecutionContext,
} from "@lucid-softworks/workflow-core";

export type WorkflowTask<TInput, TOutput> = Readonly<{
  id: string;
  input: Schema<unknown, TInput>;
  output: Schema<unknown, TOutput>;
  run: (
    input: TInput,
    context: WorkflowExecutionContext,
  ) => TOutput | PromiseLike<TOutput>;
}>;

export type AnyWorkflowTask = WorkflowTask<unknown, unknown>;
export type InferTaskInput<TTask extends AnyWorkflowTask> =
  TTask extends WorkflowTask<infer TInput, unknown> ? TInput : never;
export type InferTaskOutput<TTask extends AnyWorkflowTask> =
  TTask extends WorkflowTask<unknown, infer TOutput> ? TOutput : never;

export function defineTask<
  TInputSchema extends Schema<unknown, unknown>,
  TOutputSchema extends Schema<unknown, unknown>,
>(definition: {
  readonly id: string;
  readonly input: TInputSchema;
  readonly output: TOutputSchema;
  readonly run: (
    input: InferOutput<TInputSchema>,
    context: WorkflowExecutionContext,
  ) => InferOutput<TOutputSchema> | PromiseLike<InferOutput<TOutputSchema>>;
}): WorkflowTask<InferOutput<TInputSchema>, InferOutput<TOutputSchema>> {
  if (definition.id.length === 0)
    throw new TypeError("Task id cannot be empty");
  return {
    ...definition,
    input: definition.input as Schema<unknown, InferOutput<TInputSchema>>,
    output: definition.output as Schema<unknown, InferOutput<TOutputSchema>>,
  };
}

/** Validates input and output around the task implementation. */
export async function executeTask<TInput, TOutput>(
  task: WorkflowTask<TInput, TOutput>,
  rawInput: unknown,
  context: WorkflowExecutionContext,
): Promise<TOutput> {
  throwIfWorkflowCancelled(context.signal);
  const input = task.input.parse(rawInput);
  const output = await task.run(input, context);
  throwIfWorkflowCancelled(context.signal);
  return task.output.parse(output);
}
