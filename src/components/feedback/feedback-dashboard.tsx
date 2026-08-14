"use client";

import { useMemo, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteFeedback as deleteFeedbackRequest,
  fetchFeedbackList,
  fetchFeedbackMeta,
  updateFeedback as updateFeedbackRequest,
} from "@/lib/api/feedback";
import { getRatingLabel, getRatingScore } from "@/lib/feedback/ratings";
import type {
  FeedbackListResult,
  FeedbackQuery,
  FeedbackRating,
  FeedbackView,
  UpdateFeedbackInput,
} from "@/lib/feedback/types";
import {
  EMPTY_FILTERS,
  FeedbackFilters,
  isFilterActive,
  type FeedbackFilterValues,
} from "./feedback-filters";
import { FeedbackPagination } from "./feedback-pagination";
import { FeedbackSummary } from "./feedback-summary";
import { FeedbackTable } from "./feedback-table";
import { FeedbackDetails } from "./feedback-details";
import { EmptyState, ErrorState, TableSkeleton } from "./feedback-states";

export default function FeedbackDashboard() {
  const [filters, setFilters] = useState<FeedbackFilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<FeedbackView | null>(null);
  const [initialEditing, setInitialEditing] = useState(false);

  const queryClient = useQueryClient();

  const listParams: FeedbackQuery = useMemo(() => {
    const params: FeedbackQuery = { page, pageSize, range: filters.range };
    if (filters.search) params.search = filters.search;
    if (filters.branchId) params.branchId = filters.branchId;
    if (filters.serviceId) params.serviceId = filters.serviceId;
    if (filters.rating) params.rating = filters.rating as FeedbackRating;
    if (filters.range === "custom") {
      if (filters.customStart) params.startDate = filters.customStart;
      if (filters.customEnd) params.endDate = filters.customEnd;
    }
    return params;
  }, [filters, page, pageSize]);

  const metaQuery = useQuery({
    queryKey: ["feedback-meta"],
    queryFn: fetchFeedbackMeta,
    staleTime: 5 * 60 * 1000,
  });

  const listQuery = useQuery({
    queryKey: ["feedback-list", listParams],
    queryFn: () => fetchFeedbackList(listParams),
    placeholderData: keepPreviousData,
  });

  const listKey = ["feedback-list", listParams];

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFeedbackInput }) =>
      updateFeedbackRequest(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ["feedback-list"] });
      const previous = queryClient.getQueryData<FeedbackListResult>(listKey);
      queryClient.setQueryData<FeedbackListResult>(listKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) => {
            if (item.id !== id) return item;
            return {
              ...item,
              ...(input.rating !== undefined
                ? {
                    rating: input.rating,
                    ratingLabel: getRatingLabel(input.rating),
                    ratingScore: getRatingScore(input.rating),
                  }
                : {}),
              ...(input.comment !== undefined
                ? { comment: input.comment }
                : {}),
            };
          }),
        };
      });
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["feedback-list"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeedbackRequest(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["feedback-list"] });
      const previous = queryClient.getQueryData<FeedbackListResult>(listKey);
      queryClient.setQueryData<FeedbackListResult>(listKey, (old) =>
        old
          ? {
              ...old,
              items: old.items.filter((item) => item.id !== id),
              total: Math.max(0, old.total - 1),
            }
          : old,
      );
      setSelected(null);
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["feedback-list"] });
    },
  });

  function handleFilterChange(patch: Partial<FeedbackFilterValues>) {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(1);
  }

  function handleResetFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  async function handleSaveFeedback(
    input: UpdateFeedbackInput,
  ): Promise<FeedbackView> {
    if (!selected) throw new Error("No feedback selected.");
    const updated = await updateMutation.mutateAsync({
      id: selected.id,
      input,
    });
    setSelected(updated);
    return updated;
  }

  async function handleDeleteFeedback(id: string): Promise<void> {
    await deleteMutation.mutateAsync(id);
  }

  function handleRowSelect(item: FeedbackView) {
    setInitialEditing(false);
    setSelected(item);
  }

  function handleRowEdit(item: FeedbackView) {
    setInitialEditing(true);
    setSelected(item);
  }

  const listData = listQuery.data;
  const capabilities = listData?.viewer;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Feedback Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor, filter, and respond to patient experience feedback across
            clinical branches.
          </p>
        </div>

      </div>

      {/* KPI Summary Cards */}
      <FeedbackSummary
        summary={listData?.summary}
        loading={listQuery.isLoading && !listData}
      />

      {/* Structured Filters & Keyword Search */}
      <FeedbackFilters
        branches={metaQuery.data?.branches ?? []}
        services={metaQuery.data?.services ?? []}
        ratings={metaQuery.data?.ratings ?? []}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        disabled={metaQuery.isLoading}
      />

      {/* Table / List Container */}
      {listQuery.isError ? (
        <ErrorState
          message={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : "Unable to retrieve feedback records from server."
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : listQuery.isLoading && !listData ? (
        <TableSkeleton rows={6} />
      ) : listData && listData.items.length === 0 ? (
        <EmptyState
          hasFilters={isFilterActive(filters)}
          onClear={handleResetFilters}
        />
      ) : (
        listData && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/50 px-4.5 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">
                  Feedback Records
                </h2>
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {listData.total.toLocaleString()} total
                </span>
              </div>

              <span className="text-xs font-medium text-slate-500">
                Page {listData.page} of {listData.totalPages}
              </span>
            </div>

            {/* Table Content */}
            <FeedbackTable
              items={listData.items}
              capabilities={listData.viewer}
              onSelect={handleRowSelect}
              onEdit={handleRowEdit}
              onDelete={handleRowSelect}
              loading={listQuery.isFetching}
            />

            {/* Pagination Controls */}
            <FeedbackPagination
              page={listData.page}
              pageSize={listData.pageSize}
              total={listData.total}
              totalPages={listData.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              disabled={listQuery.isFetching}
            />
          </div>
        )
      )}

      {/* Feedback Details Slide-over Drawer */}
      {selected && capabilities && (
        <FeedbackDetails
          key={selected.id}
          feedback={selected}
          capabilities={capabilities}
          initialEditing={initialEditing}
          onClose={() => {
            setSelected(null);
            setInitialEditing(false);
          }}
          onSave={handleSaveFeedback}
          onDelete={handleDeleteFeedback}
        />
      )}
    </div>
  );
}
