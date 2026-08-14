import * as React from "react";

import { getBranches, type BranchData } from "@/features/branches/actions";
import { submitFeedback } from "@/features/feedback/actions";
import {
  getServiceByBranch,
  type ServiceData,
} from "@/features/services/actions";
import {
  phoneNumberSchema,
  submitFeedbackSchema,
  type FeedbackRating,
} from "@/lib/validation";

export type FeedbackStep = 1 | 2 | 3 | 4;
export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface FeedbackFlowState {
  step: FeedbackStep;
  phoneNumber: string;
  branchId: string;
  serviceId: string;
  rating: FeedbackRating | "";
  comment: string;
  branchSearch: string;
  branches: BranchData[];
  branchesStatus: LoadStatus;
  branchesError: string | null;
  services: ServiceData[];
  servicesStatus: LoadStatus;
  servicesError: string | null;
  isSubmitting: boolean;
  submissionId: string | null;
  topError: string | null;
  fieldErrors: Record<string, string[]>;
}

type FeedbackFlowAction =
  | { type: "SET_STEP"; step: FeedbackStep }
  | { type: "PHONE_CHANGED"; value: string }
  | { type: "SET_FIELD_ERRORS"; fieldErrors: Record<string, string[]> }
  | { type: "BRANCH_SELECTED"; branchId: string }
  | { type: "SERVICE_SELECTED"; serviceId: string }
  | { type: "RATING_SELECTED"; rating: FeedbackRating }
  | { type: "COMMENT_CHANGED"; value: string }
  | { type: "SEARCH_CHANGED"; value: string }
  | { type: "BRANCHES_LOAD_START" }
  | { type: "BRANCHES_LOAD_SUCCESS"; branches: BranchData[] }
  | { type: "BRANCHES_LOAD_ERROR"; message: string }
  | { type: "SERVICES_LOAD_START" }
  | { type: "SERVICES_LOAD_SUCCESS"; services: ServiceData[] }
  | { type: "SERVICES_LOAD_ERROR"; message: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; id: string }
  | {
      type: "SUBMIT_ERROR";
      message: string;
      fieldErrors: Record<string, string[]>;
      code?: string;
    }
  | { type: "RESET" };

function clearFieldError(
  fieldErrors: Record<string, string[]>,
  field: string,
): Record<string, string[]> {
  if (!fieldErrors[field]) return fieldErrors;
  const next = { ...fieldErrors };
  delete next[field];
  return next;
}

function createInitialState(initialBranches: BranchData[]): FeedbackFlowState {
  return {
    step: 1,
    phoneNumber: "",
    branchId: "",
    serviceId: "",
    rating: "",
    comment: "",
    branchSearch: "",
    branches: initialBranches,
    branchesStatus: initialBranches.length > 0 ? "success" : "loading",
    branchesError: null,
    services: [],
    servicesStatus: "idle",
    servicesError: null,
    isSubmitting: false,
    submissionId: null,
    topError: null,
    fieldErrors: {},
  };
}

function feedbackFlowReducer(
  state: FeedbackFlowState,
  action: FeedbackFlowAction,
): FeedbackFlowState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step, topError: null };
    case "PHONE_CHANGED":
      return {
        ...state,
        phoneNumber: action.value,
        fieldErrors: clearFieldError(state.fieldErrors, "phoneNumber"),
      };
    case "SET_FIELD_ERRORS":
      return { ...state, fieldErrors: action.fieldErrors };
    case "BRANCH_SELECTED":
      return {
        ...state,
        step: 3,
        branchId: action.branchId,
        serviceId: "",
        services: [],
        servicesStatus: "loading",
        servicesError: null,
        branchSearch: "",
        fieldErrors: clearFieldError(state.fieldErrors, "branchId"),
        topError: null,
      };
    case "SERVICE_SELECTED":
      return {
        ...state,
        step: 4,
        serviceId: action.serviceId,
        fieldErrors: clearFieldError(state.fieldErrors, "serviceId"),
        topError: null,
      };
    case "RATING_SELECTED":
      return {
        ...state,
        rating: action.rating,
        fieldErrors: clearFieldError(state.fieldErrors, "rating"),
        topError: null,
      };
    case "COMMENT_CHANGED":
      return {
        ...state,
        comment: action.value,
        fieldErrors: clearFieldError(state.fieldErrors, "comment"),
      };
    case "SEARCH_CHANGED":
      return { ...state, branchSearch: action.value };
    case "BRANCHES_LOAD_START":
      return {
        ...state,
        branchesStatus: "loading",
        branchesError: null,
        topError: null,
      };
    case "BRANCHES_LOAD_SUCCESS":
      return {
        ...state,
        branchesStatus: "success",
        branches: action.branches,
        branchesError: null,
      };
    case "BRANCHES_LOAD_ERROR":
      return {
        ...state,
        branchesStatus: "error",
        branchesError: action.message,
      };
    case "SERVICES_LOAD_START":
      return { ...state, servicesStatus: "loading", servicesError: null };
    case "SERVICES_LOAD_SUCCESS":
      return {
        ...state,
        servicesStatus: "success",
        services: action.services,
        servicesError: null,
      };
    case "SERVICES_LOAD_ERROR":
      return {
        ...state,
        servicesStatus: "error",
        servicesError: action.message,
      };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true, topError: null };
    case "SUBMIT_SUCCESS":
      return { ...state, isSubmitting: false, submissionId: action.id };
    case "SUBMIT_ERROR": {
      // If the branch/service combination is no longer valid, drop the stale
      // service selection and route the patient back to service selection so
      // they can pick one that is actually offered (API.md §11,
      // DATABASE.md §15).
      const isInvalidBranchService = action.code === "INVALID_BRANCH_SERVICE";
      return {
        ...state,
        isSubmitting: false,
        topError: action.message,
        fieldErrors: action.fieldErrors,
        ...(isInvalidBranchService
          ? {
              step: 3 as FeedbackStep,
              serviceId: "",
              services: [],
              servicesStatus: "loading" as LoadStatus,
            }
          : {}),
      };
    }
    case "RESET":
      return createInitialState([]);
    default:
      return state;
  }
}

export interface FeedbackFlowActions {
  goToStep: (step: FeedbackStep) => void;
  changePhone: (value: string) => void;
  validatePhoneOnBlur: () => void;
  submitPhone: () => void;
  selectBranch: (branchId: string) => void;
  retryLoadBranches: () => void;
  selectService: (serviceId: string) => void;
  retryLoadServices: () => void;
  chooseDifferentBranch: () => void;
  changeSearch: (value: string) => void;
  selectRating: (rating: FeedbackRating) => void;
  changeComment: (value: string) => void;
  submitRating: () => void;
  resetFlow: () => void;
}

export function useFeedbackFlow(initialBranches: BranchData[] = []): {
  state: FeedbackFlowState;
  actions: FeedbackFlowActions;
} {
  const [state, dispatch] = React.useReducer(
    feedbackFlowReducer,
    initialBranches,
    createInitialState,
  );

  // Load branches on mount when the page did not provide them.
  React.useEffect(() => {
    if (state.branchesStatus !== "loading") return;
    let cancelled = false;
    getBranches()
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          dispatch({ type: "BRANCHES_LOAD_SUCCESS", branches: res.data });
        } else {
          dispatch({ type: "BRANCHES_LOAD_ERROR", message: res.error.message });
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({
            type: "BRANCHES_LOAD_ERROR",
            message: "Unable to retrieve branch list. Please try again later.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [state.branchesStatus]);

  // Load services for the selected branch (and re-load on retry / after an
  // invalid branch-service combination).
  React.useEffect(() => {
    if (!state.branchId || state.servicesStatus !== "loading") return;
    let cancelled = false;
    getServiceByBranch({ branchId: state.branchId })
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          dispatch({ type: "SERVICES_LOAD_SUCCESS", services: res.data });
        } else {
          dispatch({ type: "SERVICES_LOAD_ERROR", message: res.error.message });
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({
            type: "SERVICES_LOAD_ERROR",
            message: "Unable to retrieve service list. Please try again later.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [state.branchId, state.servicesStatus]);

  const actions = React.useMemo<FeedbackFlowActions>(
    () => ({
      goToStep: (step) => dispatch({ type: "SET_STEP", step }),
      changePhone: (value) => dispatch({ type: "PHONE_CHANGED", value }),
      validatePhoneOnBlur: () => {
        const trimmed = state.phoneNumber.trim();
        if (!trimmed) return;
        const result = phoneNumberSchema.safeParse(trimmed);
        if (!result.success) {
          dispatch({
            type: "SET_FIELD_ERRORS",
            fieldErrors: {
              phoneNumber: result.error.issues.map((issue) => issue.message),
            },
          });
        }
      },
      submitPhone: () => {
        const result = phoneNumberSchema.safeParse(state.phoneNumber);
        if (!result.success) {
          dispatch({
            type: "SET_FIELD_ERRORS",
            fieldErrors: {
              phoneNumber: result.error.issues.map((issue) => issue.message),
            },
          });
          return;
        }
        dispatch({ type: "SET_STEP", step: 2 });
      },
      selectBranch: (branchId) =>
        dispatch({ type: "BRANCH_SELECTED", branchId }),
      retryLoadBranches: () => dispatch({ type: "BRANCHES_LOAD_START" }),
      changeSearch: (value) => dispatch({ type: "SEARCH_CHANGED", value }),
      selectService: (serviceId) =>
        dispatch({ type: "SERVICE_SELECTED", serviceId }),
      retryLoadServices: () => dispatch({ type: "SERVICES_LOAD_START" }),
      chooseDifferentBranch: () => dispatch({ type: "SET_STEP", step: 2 }),
      selectRating: (rating) => dispatch({ type: "RATING_SELECTED", rating }),
      changeComment: (value) => dispatch({ type: "COMMENT_CHANGED", value }),
      submitRating: async () => {
        const parsed = submitFeedbackSchema.safeParse({
          phoneNumber: state.phoneNumber,
          branchId: state.branchId,
          serviceId: state.serviceId,
          rating: state.rating,
          comment: state.comment.trim() || undefined,
        });
        if (!parsed.success) {
          dispatch({
            type: "SET_FIELD_ERRORS",
            fieldErrors: parsed.error.flatten().fieldErrors,
          });
          return;
        }
        dispatch({ type: "SUBMIT_START" });
        try {
          const res = await submitFeedback(parsed.data);
          if (res.success) {
            dispatch({ type: "SUBMIT_SUCCESS", id: res.data.id });
          } else {
            dispatch({
              type: "SUBMIT_ERROR",
              message: res.error.message,
              fieldErrors: res.error.fieldErrors ?? {},
              code: res.error.code,
            });
          }
        } catch {
          dispatch({
            type: "SUBMIT_ERROR",
            message: "An unexpected error occurred. Please try again.",
            fieldErrors: {},
          });
        }
      },
      resetFlow: () => dispatch({ type: "RESET" }),
    }),
    [state],
  );

  return { state, actions };
}
