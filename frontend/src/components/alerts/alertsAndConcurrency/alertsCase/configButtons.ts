import {
  buildElevatedThtChatMessage,
  buildWorkerNotEndMessage,
  buildWorkerNotResumeMessage,
  buildWorkerOutSlaMessage,
  buildWorkerSendFirstGreetingMessage
} from './builders';

import type { ActionConfig } from '@/components/types/alerts.type';

export const ALERTS_ACTIONS: ActionConfig[] = [
  {
    label: "As no retoma",
    builder: buildWorkerNotResumeMessage,
    colorClass: "bg-blue-600 hover:bg-blue-700",
  },
  {
    label: "Agilizar Chat",
    builder: buildElevatedThtChatMessage,
    colorClass: "bg-green-600 hover:bg-green-700",
  },
  {
    label: "As no cierra chat",
    builder: buildWorkerNotEndMessage,  
    colorClass: "bg-red-600 hover:bg-red-700",
  },
  {
    label: "As no saluda",
    builder: buildWorkerSendFirstGreetingMessage,
    colorClass: "bg-purple-600 hover:bg-purple-700",
  },
  {
    label: "Saludo + 30s",
    builder: buildWorkerOutSlaMessage,
    colorClass: "bg-blue-600 hover:bg-blue-700",
  },
];
