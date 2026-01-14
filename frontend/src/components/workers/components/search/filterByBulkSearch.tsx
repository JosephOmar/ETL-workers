import type { SearchField } from "@/components/types/table-column";
import { parseBulkInput } from "@/components/utils/UtilsForText";
import type { Worker } from "@/components/types/worker.type";
import { flexibleNameMatch } from "@/components/utils/UtilsForText";

export const filterByBulkSearch =
  (
    searchText: string,
    field: SearchField
  ) =>
  (worker: Worker): boolean => {
    if (!searchText.trim()) return true;

    const values = parseBulkInput(searchText);

    if (field === "document") {
      return values.includes(worker.document);
    }


    if (field === "email") {
      return ( !!worker.api_email && values.includes(worker.api_email));
    }

    return values.some(v =>
      flexibleNameMatch(worker.name, v)
    );
  };
