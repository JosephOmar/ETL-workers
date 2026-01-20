import { ChevronDown } from "lucide-react";

export function NavItem({label,children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 font-medium text-gray-800 hover:text-black">
        {label}
        <ChevronDown size={14} />
      </button>

      <div className="absolute left-0 top-full z-50 hidden pt-2 group-hover:block">
        {children}
      </div>
    </div>
  );
}

export function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-[180px] rounded-md border bg-white shadow-lg">
      <ul className="flex flex-col p-2">{children}</ul>
    </div>
  )
}

export function DropdownLink({href,children,}: {href: string, children: React.ReactNode}) {
  return (
    <li>
      <a href={href} className="block rounded px-3 py-2 text-sm hover:bg-gray-100">
        {children}
      </a>
    </li>
  )
}

export function DropdownIconLink({href,icon,label}: {href: string, icon: React.ReactNode, label: string}) {
  return (
    <li>
      <a href={href} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100">
        {icon}
        {label}
      </a>
    </li>
  )
}

export function Logo() {
  return (
    <a href="/" className="mr-6 text-lg font-bold">
      GTR Support
    </a>
  )
}

