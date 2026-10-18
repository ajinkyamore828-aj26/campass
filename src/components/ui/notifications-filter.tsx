"use client"

import * as React from "react"
import {
  Bell,
  Info,
  AlertCircle,
  Calendar,
  Filter,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface NotificationItem {
  id: string
  category: "updates" | "alerts" | "reminders"
  icon: React.ReactNode
  title: string
  description: string
  time: string
}

export interface NotificationsFilterProps {
  items?: NotificationItem[]
  placement?: "top" | "bottom" | "left" | "right"
}

const defaultNotifications: NotificationItem[] = [
  {
    id: "1",
    category: "updates",
    icon: <Info className="h-4 w-4" />,
    title: "System Update",
    description: "A new feature has been deployed.",
    time: "just now",
  },
  {
    id: "2",
    category: "alerts",
    icon: <AlertCircle className="h-4 w-4" />,
    title: "Security Alert",
    description: "Suspicious login detected.",
    time: "1h ago",
  },
  {
    id: "3",
    category: "reminders",
    icon: <Calendar className="h-4 w-4" />,
    title: "Meeting Reminder",
    description: "Project sync at 3 PM.",
    time: "2h ago",
  },
  {
    id: "4",
    category: "updates",
    icon: <Info className="h-4 w-4" />,
    title: "Weekly Report",
    description: "Your weekly summary is ready.",
    time: "1d ago",
  },
]

const categories = [
  { key: "all", label: "All" },
  { key: "updates", label: "Updates" },
  { key: "alerts", label: "Alerts" },
  { key: "reminders", label: "Reminders" },
]

export default function NotificationsFilter({
  items = defaultNotifications,
  placement = "bottom",
}: NotificationsFilterProps) {
  const [selected, setSelected] = React.useState("all")

  const filteredItems =
    selected === "all"
      ? items
      : items.filter((item) => item.category === selected)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-muted text-slate-700 hover:text-slate-900 transition-colors">
          <Bell className="h-5 w-5" />
          {items.length > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 text-xs px-1.5 py-0 bg-red-600 text-white rounded-full font-bold"
            >
              {items.length}
            </Badge>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side={placement}
        align="center"
        className="w-84 p-0 shadow-xl border border-slate-200 bg-white rounded-xl overflow-hidden"
      >
        {/* Header with filter */}
        <div className="flex justify-between items-center border-b border-slate-100 px-4 py-2.5 bg-slate-50/70">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
            <Filter className="h-4 w-4 text-slate-500" /> Notifications
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {items.length} Total
          </span>
        </div>

        {/* Category buttons */}
        <div className="flex gap-1.5 px-3 py-2 border-b border-slate-100 overflow-x-auto bg-white">
          {categories.map((cat) => (
            <Button
              key={cat.key}
              variant={selected === cat.key ? "secondary" : "ghost"}
              size="sm"
              className={`text-xs px-2.5 py-1 h-7 rounded-lg font-medium transition-colors ${
                selected === cat.key 
                  ? "bg-zinc-900 text-white hover:bg-zinc-800" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              onClick={() => setSelected(cat.key)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Notifications list */}
        {filteredItems.length === 0 ? (
          <div className="p-6 text-sm text-slate-400 text-center">
            No notifications in this category
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 mt-0.5">{item.icon}</span>
                    <span className="font-semibold text-sm text-slate-800">{item.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
