"use client";

import React, { useState, useRef, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AnimateChangeInHeight } from "@/components/ui/filters";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { nanoid } from "nanoid";
import {
  CircleDashed,
  Tag,
  Users,
  Building2,
  Ticket,
  Utensils,
  ListFilter,
  Check,
  X,
  Code2,
  Code,
  Palette,
  Cpu,
  Trophy,
  GraduationCap,
  Briefcase,
  Clock,
  AlertCircle,
  Lock,
  Lightbulb,
  Award,
  PartyPopper,
  BookOpen,
  Compass,
} from "lucide-react";

export type CampusFilterDimension =
  | "Status"
  | "Category"
  | "Participation"
  | "Department"
  | "Fee"
  | "Meal Pass";

export type CampusFilterOperator = "is" | "is not" | "is any of";

export interface CampusFilter {
  id: string;
  type: CampusFilterDimension;
  operator: CampusFilterOperator;
  values: string[];
}

export interface DimensionOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface CampusEventFiltersProps {
  filters: CampusFilter[];
  setFilters: React.Dispatch<React.SetStateAction<CampusFilter[]>>;
  availableDepartments: string[];
  totalMatches: number;
}

export const CampusEventFilters: React.FC<CampusEventFiltersProps> = ({
  filters,
  setFilters,
  availableDepartments,
  totalMatches,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<CampusFilterDimension | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Muted Monochrome Dimension Definitions & Icons (1:1 with Reference Image 1)
  const dimensionMetadata = useMemo(() => {
    return {
      Status: {
        icon: <CircleDashed className="size-[18px] text-muted-foreground shrink-0" />,
        options: [
          { id: "OPEN", label: "Open for Registration", icon: <Check className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "CLOSING_SOON", label: "Closing Soon", icon: <Clock className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "FULL", label: "Full / Waitlist Only", icon: <AlertCircle className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "CLOSED", label: "Closed", icon: <Lock className="size-[16px] text-muted-foreground shrink-0" /> },
        ] as DimensionOption[],
      },
      Category: {
        icon: <Tag className="size-[18px] text-muted-foreground shrink-0" />,
        options: [
          { id: "HACKATHON", label: "Hackathons", icon: <Cpu className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "IDEATHON", label: "Ideathons", icon: <Lightbulb className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "CODING_COMPETITION", label: "Coding Contests", icon: <Code className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "APTITUDE", label: "Aptitude Tests", icon: <Award className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "CULTURAL", label: "Cultural Events", icon: <Palette className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "FRESHER_PARTY", label: "Fresher Parties", icon: <PartyPopper className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "BOOTCAMP", label: "Bootcamps", icon: <BookOpen className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "CAMPUS_DRIVE", label: "Campus Drives", icon: <Briefcase className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "SEMINAR", label: "Seminars", icon: <GraduationCap className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "TECHNICAL", label: "Technical", icon: <Compass className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "SPORTS", label: "Sports", icon: <Trophy className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "WORKSHOP", label: "Workshops", icon: <Cpu className="size-[16px] text-muted-foreground shrink-0" /> },
        ] as DimensionOption[],
      },
      Participation: {
        icon: <Users className="size-[18px] text-muted-foreground shrink-0" />,
        options: [
          { id: "INDIVIDUAL", label: "Individual Only", icon: <Users className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "TEAM", label: "Team Participation", icon: <Users className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "BOTH", label: "Both (Solo or Team)", icon: <Users className="size-[16px] text-muted-foreground shrink-0" /> },
        ] as DimensionOption[],
      },
      Department: {
        icon: <Building2 className="size-[18px] text-muted-foreground shrink-0" />,
        options: availableDepartments.map((dept) => ({
          id: dept,
          label: dept,
          icon: <Building2 className="size-[16px] text-muted-foreground shrink-0" />,
        })) as DimensionOption[],
      },
      Fee: {
        icon: <Ticket className="size-[18px] text-muted-foreground shrink-0" />,
        options: [
          { id: "FREE", label: "Free Entry (₹0)", icon: <Check className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "PAID", label: "Paid Ticket Required", icon: <Ticket className="size-[16px] text-muted-foreground shrink-0" /> },
        ] as DimensionOption[],
      },
      "Meal Pass": {
        icon: <Utensils className="size-[18px] text-muted-foreground shrink-0" />,
        options: [
          { id: "YES", label: "Lunch Voucher Included", icon: <Utensils className="size-[16px] text-muted-foreground shrink-0" /> },
          { id: "NO", label: "No Meal Pass", icon: <X className="size-[16px] text-muted-foreground shrink-0" /> },
        ] as DimensionOption[],
      },
    };
  }, [availableDepartments]);

  // Two-group dimension structure matching Reference Image 1 exactly
  const dimensionGroups: { name: CampusFilterDimension; icon: React.ReactNode }[][] = [
    [
      { name: "Status", icon: dimensionMetadata["Status"].icon },
      { name: "Category", icon: dimensionMetadata["Category"].icon },
      { name: "Participation", icon: dimensionMetadata["Participation"].icon },
      { name: "Department", icon: dimensionMetadata["Department"].icon },
    ],
    [
      { name: "Fee", icon: dimensionMetadata["Fee"].icon },
      { name: "Meal Pass", icon: dimensionMetadata["Meal Pass"].icon },
    ],
  ];

  // Helper to get option display label
  const getOptionLabel = (dim: CampusFilterDimension, val: string): string => {
    const list = dimensionMetadata[dim]?.options;
    const item = list?.find((o) => o.id === val);
    return item ? item.label : val;
  };

  const getOptionIcon = (dim: CampusFilterDimension, val: string): React.ReactNode => {
    const list = dimensionMetadata[dim]?.options;
    const item = list?.find((o) => o.id === val);
    return item?.icon || dimensionMetadata[dim]?.icon;
  };

  // Add or update filter value
  const handleAddOrToggleFilterValue = (dim: CampusFilterDimension, valueId: string) => {
    setFilters((prev) => {
      const existing = prev.find((f) => f.type === dim);
      if (!existing) {
        return [
          ...prev,
          {
            id: nanoid(),
            type: dim,
            operator: "is",
            values: [valueId],
          },
        ];
      }
      // Toggle value
      const exists = existing.values.includes(valueId);
      const newValues = exists
        ? existing.values.filter((v) => v !== valueId)
        : [...existing.values, valueId];

      if (newValues.length === 0) {
        return prev.filter((f) => f.id !== existing.id);
      }

      const newOp: CampusFilterOperator =
        newValues.length > 1
          ? existing.operator === "is not"
            ? "is not"
            : "is any of"
          : existing.operator === "is not"
          ? "is not"
          : "is";

      return prev.map((f) =>
        f.id === existing.id
          ? {
              ...f,
              operator: newOp,
              values: newValues,
            }
          : f
      );
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-sm">
      {/* ── Active Filter Pills (Linear-style Segmented) ── */}
      <AnimatePresence mode="popLayout">
        {filters.map((filter) => {
          const dimMeta = dimensionMetadata[filter.type];
          return (
            <motion.div
              key={filter.id}
              initial={{ opacity: 0, scale: 0.95, y: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -2 }}
              transition={{ duration: 0.12 }}
              className="inline-flex items-center rounded-md border border-slate-200/90 bg-white text-sm shadow-2xs overflow-hidden h-9"
            >
              {/* Segment 1: Filter Dimension Label & Icon */}
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-700 font-semibold border-r border-slate-200/80 h-full text-sm">
                {dimMeta?.icon}
                <span>{filter.type}</span>
              </div>

              {/* Segment 2: Operator Dropdown (is / is not / is any of) */}
              <DropdownMenu>
                <DropdownMenuTrigger className="px-2.5 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium transition cursor-pointer border-r border-slate-200/80 h-full text-sm">
                  {filter.operator}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[130px] text-sm p-1">
                  <DropdownMenuItem
                    onClick={() =>
                      setFilters((prev) =>
                        prev.map((f) =>
                          f.id === filter.id
                            ? {
                                ...f,
                                operator: f.values.length > 1 ? "is any of" : "is",
                              }
                            : f
                        )
                      )
                    }
                    className="py-2 px-2.5 text-sm cursor-pointer"
                  >
                    {filter.values.length > 1 ? "is any of" : "is"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setFilters((prev) =>
                        prev.map((f) =>
                          f.id === filter.id
                            ? {
                                ...f,
                                operator: "is not",
                              }
                            : f
                        )
                      )
                    }
                    className="py-2 px-2.5 text-sm cursor-pointer"
                  >
                    is not
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Segment 3: Filter Value Combobox Popover */}
              <Popover>
                <PopoverTrigger className="flex items-center gap-1.5 px-3 py-1 text-slate-800 hover:bg-slate-50 font-medium transition cursor-pointer h-full text-sm">
                  <div className="flex items-center -space-x-1">
                    {filter.values.slice(0, 2).map((val) => (
                      <span
                        key={val}
                        className="inline-flex items-center justify-center size-5 rounded-full bg-slate-100 text-[11px]"
                      >
                        {getOptionIcon(filter.type, val)}
                      </span>
                    ))}
                  </div>
                  <span>
                    {filter.values.length === 1
                      ? getOptionLabel(filter.type, filter.values[0])
                      : `${filter.values.length} selected`}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="cp-filter-popover w-[280px] p-0 border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden" align="start">
                  <AnimateChangeInHeight>
                    <Command className="rounded-none bg-transparent">
                      <CommandInput
                        placeholder={`Filter ${filter.type}...`}
                        className="h-10 text-[14px]"
                      />
                      <CommandList className="cp-filter-list max-h-[280px] overflow-y-auto">
                        <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">No matching options.</CommandEmpty>
                        <CommandGroup className="p-0">
                          {dimMeta?.options.map((opt) => {
                            const isChecked = filter.values.includes(opt.id);
                            return (
                              <CommandItem
                                key={opt.id}
                                value={opt.label}
                                onSelect={() =>
                                  handleAddOrToggleFilterValue(filter.type, opt.id)
                                }
                                className="cp-filter-item text-[14px] text-slate-700 dark:text-zinc-300"
                              >
                                <Checkbox checked={isChecked} className="size-4 rounded-sm" />
                                {opt.icon}
                                <span className="flex-1 truncate font-medium text-[14px]">{opt.label}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </AnimateChangeInHeight>
                </PopoverContent>
              </Popover>

              {/* Segment 4: Clear Single Filter Button */}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => prev.filter((f) => f.id !== filter.id))
                }
                className="flex items-center justify-center size-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-l border-slate-200/80 transition cursor-pointer"
                title={`Remove ${filter.type} filter`}
              >
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── Clear All Filters Button ── */}
      {filters.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters([])}
          className="h-9 text-sm px-3 text-muted-foreground hover:text-foreground border-slate-200 hover:bg-slate-100 rounded-md transition font-medium"
        >
          Clear
        </Button>
      )}

      {/* ── Add Filter Combobox Trigger Popover (1:1 with Reference Image 1) ── */}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setTimeout(() => {
              setSelectedDimension(null);
              setCommandInput("");
            }, 200);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="sm"
            className={cn(
              "transition group h-10 text-[15px] items-center rounded-md flex gap-2.5 text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold px-3.5 cursor-pointer",
              filters.length > 0 && "w-10 px-0 justify-center"
            )}
          >
            <ListFilter className="size-[20px] shrink-0 text-slate-800 dark:text-zinc-200 group-hover:text-slate-950 dark:group-hover:text-white" />
            {!filters.length && <span className="font-bold text-[15px]">Filter</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="cp-filter-popover w-[270px] p-0 border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          align="start"
        >
          <AnimateChangeInHeight>
            <Command className="rounded-none bg-transparent">
              <CommandInput
                placeholder={selectedDimension ? `Filter ${selectedDimension}...` : "Filter..."}
                className="h-10 text-[14px]"
                value={commandInput}
                onInputCapture={(e) => setCommandInput(e.currentTarget.value)}
                ref={commandInputRef}
              />
              <CommandList className="cp-filter-list max-h-[300px] overflow-y-auto">
                <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                  No results found.
                </CommandEmpty>

                {selectedDimension ? (
                  // Step 2: Show items for the selected dimension (with checkboxes & monochrome icons)
                  <CommandGroup className="p-0">
                    {dimensionMetadata[selectedDimension]?.options.map((opt) => {
                      const existing = filters.find((f) => f.type === selectedDimension);
                      const isChecked = existing?.values.includes(opt.id) ?? false;
                      return (
                        <CommandItem
                          key={opt.id}
                          value={opt.label}
                          onSelect={() => {
                            handleAddOrToggleFilterValue(selectedDimension, opt.id);
                            setTimeout(() => {
                              setSelectedDimension(null);
                              setCommandInput("");
                            }, 150);
                            setOpen(false);
                          }}
                          className="cp-filter-item text-[14px] text-slate-700 dark:text-zinc-300"
                        >
                          <Checkbox checked={isChecked} className="size-4 rounded-sm" />
                          {opt.icon}
                          <span className="flex-1 truncate font-medium text-[14px]">
                            {opt.label}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ) : (
                  // Step 1: Show available dimensions in two groups with thin divider (1:1 with Reference Image 1)
                  dimensionGroups.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      <CommandGroup className="p-0">
                        {group.map((dim) => (
                          <CommandItem
                            key={dim.name}
                            value={dim.name}
                            onSelect={() => {
                              setSelectedDimension(dim.name);
                              setCommandInput("");
                              commandInputRef.current?.focus();
                            }}
                            className="cp-filter-item text-[14.5px] text-slate-700 dark:text-zinc-300"
                          >
                            {dim.icon}
                            <span className="font-medium text-[14.5px]">
                              {dim.name}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {gIdx < dimensionGroups.length - 1 && (
                        <CommandSeparator className="my-1.5 mx-1 bg-slate-100 dark:bg-zinc-800" />
                      )}
                    </React.Fragment>
                  ))
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </PopoverContent>
      </Popover>
    </div>
  );
};
