import { useWorkersStore } from "@/components/store/workerStore";

export const WorkersBulkSearch = () => {
  const searchText = useWorkersStore(s => s.searchText);
  const searchField = useWorkersStore(s => s.searchField);
  const setSearchText = useWorkersStore(s => s.setSearchText);
  const setSearchField = useWorkersStore(s => s.setSearchField);

  const baseBtn = "py-1 px-3 rounded-sm border-2";
  const activeBtn = "border-black";
  const inactiveBtn = "border-transparent";

  return (
    <div className="space-y-2">
      <label className="font-semibold">Bulk Search</label>

      <textarea
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full border rounded p-2 min-h-[120px]"
        placeholder="One value per line"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setSearchField("name")}
          className={`btn-grad ${baseBtn} ${searchField === "name" ? activeBtn : inactiveBtn}`}
        >
          Name
        </button>

        <button
          onClick={() => setSearchField("document")}
          className={`btn-grad ${baseBtn} ${searchField === "document" ? activeBtn : inactiveBtn}`}
        >
          Document
        </button>

        <button
          onClick={() => setSearchField("email")}
          className={`btn-grad ${baseBtn} ${searchField === "email" ? activeBtn : inactiveBtn}`}
        >
          Email
        </button>
      </div>
    </div>
  );
};

