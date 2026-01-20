import type { ActionConfig } from "@/components/types/alerts.type";
import { ActionButton } from "./ActionButton";

interface Props {
  actions: ActionConfig[];
  onAction: (builder: any) => void;
}

export const ActionsGrid: React.FC<Props> = ({ actions, onAction }) => (
  <div className="flex flex-wrap justify-center gap-2 lg:w-[40vw] w-[70vw] mx-auto">
    {actions.map(({ label, builder, colorClass }) => (
      <ActionButton
        key={label}
        label={label}
        colorClass={colorClass}
        onClick={() => onAction(builder)}
      />
    ))}
  </div>
);