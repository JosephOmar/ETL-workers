type Option = {
  label: string;
  value: string;
};

type SelectFilterProps<T extends string | string[]> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Option[];
  multiple?: boolean;
  className?: string;
};

const SelectFilter = <T extends string | string[]>({
  label,
  value,
  onChange,
  options,
  multiple = false,
  className = "",
}: SelectFilterProps<T>) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const values = Array.from(e.target.selectedOptions).map(o => o.value);
      onChange(values as T);
    } else {
      onChange(e.target.value as T);
    }
  };
  const maxVisibleOptions = 8;
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <select
        multiple={multiple}
        value={value}
        onChange={handleChange}
        size={
          multiple
            ? Math.min(options.length, maxVisibleOptions)
            : undefined
        }
        className={`w-full border-gray-300 rounded px-2 py-1 ${className}`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectFilter;
