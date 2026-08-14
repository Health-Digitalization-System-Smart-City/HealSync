"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Filter,
  MessageSquareText,
  Phone,
  PhoneOff,
  Search,
  Shield,
  Star,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CLINIC_BRANCHES,
  MEDICAL_SERVICES,
  PATIENT_FEEDBACK_DATA,
  type PatientFeedback,
} from "@/lib/dashboard-data";
import type { Role } from "@/lib/permissions";

export function FeedbackClient({ userRole }: { userRole: Role }) {
  const [feedbackList, setFeedbackList] = useState<PatientFeedback[]>(PATIENT_FEEDBACK_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<PatientFeedback | null>(null);

  const isAdmin = userRole === "admin";
  const canUpdate = userRole === "admin" || userRole === "manager";

  const filtered = feedbackList.filter((fb) => {
    const matchesSearch =
      fb.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.predefinedTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBranch = branchFilter === "all" ? true : fb.branchName === branchFilter;
    const matchesSentiment = sentimentFilter === "all" ? true : fb.sentiment === sentimentFilter;
    const matchesRating = ratingFilter === "all" ? true : fb.rating === Number(ratingFilter);
    const matchesStatus = statusFilter === "all" ? true : fb.status === statusFilter;

    return matchesSearch && matchesBranch && matchesSentiment && matchesRating && matchesStatus;
  });

  function handleUpdateStatus(id: string, newStatus: PatientFeedback["status"]) {
    if (!canUpdate) return;
    setFeedbackList((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: newStatus,
              resolvedBy: newStatus === "resolved" ? (isAdmin ? "Admin Supervisor" : "Duty Manager") : undefined,
            }
          : f,
      ),
    );
    if (selectedFeedback?.id === id) {
      setSelectedFeedback((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  }

  function handleDeleteFeedback(id: string) {
    if (!isAdmin) return;
    setFeedbackList((prev) => prev.filter((f) => f.id !== id));
    setSelectedFeedback(null);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Search & Filter Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback comments, tags, departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by clinic branch"
              >
                <option value="all">All 13 Branches</option>
                {CLINIC_BRANCHES.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by sentiment"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by star rating"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by review status"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>

              {(searchQuery || branchFilter !== "all" || sentimentFilter !== "all" || ratingFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setSearchQuery("");
                    setBranchFilter("all");
                    setSentimentFilter("all");
                    setRatingFilter("all");
                    setStatusFilter("all");
                  }}
                  className="text-xs text-muted-foreground"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Access Notice */}
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          <span>
            {isAdmin
              ? "Admin Role: Full unmasked patient data and administrative deletion permitted."
              : userRole === "manager"
                ? "Manager Role: Operational resolution access. Patient phone numbers masked per privacy policy."
                : "Analyst Role: Read-only aggregated feedback review."}
          </span>
        </div>
        <span className="font-semibold text-foreground">{filtered.length} responses</span>
      </div>

      {/* Feedback Item Grid / List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No patient feedback matches your filter criteria.</p>
          </Card>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.rating}.0</span>
                  </div>

                  <span className="font-semibold text-sm text-foreground">{item.branchName}</span>
                  <span className="text-xs text-muted-foreground">• {item.serviceName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.sentiment === "positive"
                        ? "default"
                        : item.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize text-[10px]"
                  >
                    {item.sentiment}
                  </Badge>

                  <Badge
                    variant={
                      item.status === "resolved"
                        ? "outline"
                        : item.status === "investigating"
                          ? "secondary"
                          : "destructive"
                    }
                    className="capitalize text-[10px]"
                  >
                    {item.status}
                  </Badge>

                  <span className="text-[11px] text-muted-foreground">{item.submittedAt}</span>
                </div>
              </div>

              {/* Patient Comment */}
              <p className="text-xs text-foreground/90 leading-relaxed italic bg-muted/20 p-2.5 rounded-lg border border-border/50">
                &ldquo;{item.comment}&rdquo;
              </p>

              {/* Tags & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.predefinedTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {isAdmin ? (
                      <span className="flex items-center gap-1 text-foreground">
                        <Phone className="size-3 text-emerald-500" />
                        {item.patientPhone}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground/70">
                        <PhoneOff className="size-3" />
                        +1 (555) ***-****
                      </span>
                    )}
                  </span>

                  {canUpdate && item.status !== "resolved" ? (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleUpdateStatus(item.id, "resolved")}
                      className="gap-1 text-xs"
                    >
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      <span>Resolve</span>
                    </Button>
                  ) : null}

                  {isAdmin ? (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDeleteFeedback(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                      aria-label="Delete feedback"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
