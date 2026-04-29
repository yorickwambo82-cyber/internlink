'use client';

import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Briefcase, Wifi, Tag, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  search: string;
  city: string;
  type: string;
  remoteType: string;
  category: string;
  paidOnly: boolean;
  sort: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onFilter: (filters: SearchFilters) => void;
  filters?: Partial<SearchFilters>;
  categories?: { id: string; name: string }[];
  cities?: string[];
}

const defaultFilters: SearchFilters = {
  search: '',
  city: 'all',
  type: 'all',
  remoteType: 'all',
  category: 'all',
  paidOnly: false,
  sort: 'newest',
};

export default function SearchBar({
  onSearch,
  onFilter,
  filters: initialFilters,
  categories = [],
  cities = [],
}: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = useCallback(
    (key: keyof SearchFilters, value: string | boolean) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFilter(newFilters);
    },
    [filters, onFilter]
  );

  const handleSearch = useCallback(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const handleClearFilters = () => {
    const cleared = { ...defaultFilters };
    setFilters(cleared);
    onFilter(cleared);
    onSearch(cleared);
  };

  const activeFilterCount = [
    filters.city !== 'all',
    filters.type !== 'all',
    filters.remoteType !== 'all',
    filters.category !== 'all',
    filters.paidOnly,
    filters.sort !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search internships by title, company, or keyword..."
            className="pl-9 h-10"
            value={filters.search}
            onChange={(e) => {
              const val = e.target.value;
              setFilters((prev) => ({ ...prev, search: val }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="icon"
          className="h-10 w-10 shrink-0 relative"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <Button variant="default" className="h-10 px-4" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-muted/50 rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* City filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                <MapPin className="h-3 w-3 inline mr-1" />
                City
              </Label>
              <Select
                value={filters.city}
                onValueChange={(v) => updateFilter('city', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                <Briefcase className="h-3 w-3 inline mr-1" />
                Type
              </Label>
              <Select
                value={filters.type}
                onValueChange={(v) => updateFilter('type', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="APPRENTICESHIP">Apprenticeship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remote Type filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                <Wifi className="h-3 w-3 inline mr-1" />
                Remote Type
              </Label>
              <Select
                value={filters.remoteType}
                onValueChange={(v) => updateFilter('remoteType', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="ON_SITE">On-site</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                <Tag className="h-3 w-3 inline mr-1" />
                Category
              </Label>
              <Select
                value={filters.category}
                onValueChange={(v) => updateFilter('category', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Paid only + Sort row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="paid-only"
                  checked={filters.paidOnly}
                  onCheckedChange={(v) => updateFilter('paidOnly', v)}
                />
                <Label htmlFor="paid-only" className="text-sm">
                  Paid only
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <Select
                  value={filters.sort}
                  onValueChange={(v) => updateFilter('sort', v)}
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="stipend">Stipend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={handleClearFilters}
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
