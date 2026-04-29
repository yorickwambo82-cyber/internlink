'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SearchBar, { type SearchFilters } from '@/components/shared/SearchBar';
import OfferCard from '@/components/shared/OfferCard';
import EmptyState from '@/components/shared/EmptyState';
import type { Offer, Category } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function BrowseOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    city: 'all',
    type: 'all',
    remoteType: 'all',
    category: 'all',
    paidOnly: false,
    sort: 'newest',
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Build query string from filters
  const buildQuery = useCallback(
    (pageNum: number, currentFilters: SearchFilters) => {
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '8');

      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.city && currentFilters.city !== 'all')
        params.set('city', currentFilters.city);
      if (currentFilters.type && currentFilters.type !== 'all')
        params.set('type', currentFilters.type);
      if (currentFilters.remoteType && currentFilters.remoteType !== 'all')
        params.set('remoteType', currentFilters.remoteType);
      if (currentFilters.category && currentFilters.category !== 'all')
        params.set('categoryId', currentFilters.category);
      if (currentFilters.paidOnly) params.set('paid', 'true');
      if (currentFilters.sort === 'deadline') params.set('sort', 'deadline');
      if (currentFilters.sort === 'stipend') params.set('sort', 'stipend');
      if (selectedCategory) params.set('categoryId', selectedCategory);

      return params.toString();
    },
    [selectedCategory]
  );

  // Fetch offers
  const fetchOffers = useCallback(
    async (pageNum: number, currentFilters: SearchFilters, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const query = buildQuery(pageNum, currentFilters);
        const res = await fetch(`/api/offers?${query}`);
        const data = await res.json();

        if (data.success) {
          setOffers((prev) =>
            append ? [...prev, ...data.data.offers] : data.data.offers
          );
          setTotalPages(data.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch offers:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildQuery]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    setPage(1);
    fetchOffers(1, filters);
  }, [filters, selectedCategory, fetchOffers]);

  const handleSearch = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters);
      setSelectedCategory(null);
    },
    []
  );

  const handleFilter = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters);
    },
    []
  );

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOffers(nextPage, filters, true);
  };

  const cities = Array.from(
    new Set(
      offers
        .map((o) => o.city)
        .filter(Boolean) as string[]
    )
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Browse Offers
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover internship and apprenticeship opportunities.
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants}>
        <SearchBar
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filters}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          cities={cities}
        />
      </motion.div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className="cursor-pointer transition-colors text-xs px-3 py-1"
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
              {cat._count && (
                <span className="ml-1 opacity-70">({cat._count.offers})</span>
              )}
            </Badge>
          ))}
        </motion.div>
      )}

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No offers found"
          description="Try adjusting your search or filters to find opportunities."
          actionLabel="Clear Filters"
          onAction={() => {
            setFilters({
              search: '',
              city: 'all',
              type: 'all',
              remoteType: 'all',
              category: 'all',
              paidOnly: false,
              sort: 'newest',
            });
            setSelectedCategory(null);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer, i) => (
              <motion.div key={offer.id} variants={itemVariants}>
                <OfferCard offer={offer} delay={i * 0.05} />
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More (${page}/${totalPages})`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
