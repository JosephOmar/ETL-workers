"use client"

import * as React from "react"
import { ChevronDown, CircleHelp, Circle, CircleCheck } from "lucide-react"
import { NavItem, Logo, Dropdown, DropdownIconLink, DropdownLink } from "../ui/navitems"

export function Header() {
  return (
    <header className="w-full border-b bg-white">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Logo />

        <NavItem label="Reports">
          <Dropdown>
            <DropdownLink href="/reports/adherence">Adherence</DropdownLink>
            <DropdownLink href="/reports/forecast-vs-real">Forecast vs Real</DropdownLink>
            <DropdownLink href="/reports/sla-breached">SLA Breached</DropdownLink>
          </Dropdown>
        </NavItem>

        <NavItem label="Components">
          <Dropdown>
            <DropdownLink href="/docs">Docs</DropdownLink>
            <DropdownLink href="/install">Install</DropdownLink>
          </Dropdown>
        </NavItem>

        <NavItem label="With Icon">
          <Dropdown>
            <DropdownIconLink
              href="#"
              icon={<CircleHelp size={16} />}
              label="Backlog"
            />
            <DropdownIconLink
              href="#"
              icon={<Circle size={16} />}
              label="To Do"
            />
            <DropdownIconLink
              href="#"
              icon={<CircleCheck size={16} />}
              label="Done"
            />
          </Dropdown>
        </NavItem>
      </nav>
    </header>
  )
}
