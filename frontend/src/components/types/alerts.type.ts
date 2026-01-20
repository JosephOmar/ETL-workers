import type { Worker } from "./worker.type";

export interface BreachedInputs {
  nameInput: string;
  urlInput: string;
  timeInput: string;
}

export interface ActionConfig {
  label: string;
  colorClass: string;
  builder: MessageBuilder;
}

export type MessageBuilder<T = MessageData> = (data: T) => string;

export type MessageBuilderNoTime = (
  data: Omit<MessageData, "diffSec" | "hmsStr">
) => string;


export interface MessageData {
  worker: Worker;
  contractLabel: string;
  diffSec?: number;
  hmsStr?: string;
  url: string;
}

