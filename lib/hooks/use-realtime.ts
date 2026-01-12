import {
    RealtimeChannel,
    RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "../supabase";

type TableName =
    | "groups"
    | "group_members"
    | "expenses"
    | "expense_splits"
    | "settlements"
    | "notifications"
    | "activity_log"
    | "debt_assignments"
    | "debt_assignment_requests";

interface UseRealtimeOptions {
    table: TableName;
    filter?: string;
    onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
}

/**
 * Hook to subscribe to real-time changes on a Supabase table
 * Automatically invalidates relevant React Query caches
 */
export const useRealtime = (options: UseRealtimeOptions) => {
    const queryClient = useQueryClient();
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        const channelName = options.filter
            ? `${options.table}-${options.filter}`
            : options.table;

        const channel = supabase
            .channel(channelName)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: options.table,
                    filter: options.filter,
                },
                (payload: RealtimePostgresChangesPayload<any>) => {
                    console.log(
                        `[Realtime] ${options.table}:`,
                        payload.eventType,
                        payload
                    );

                    // Invalidate relevant queries
                    switch (options.table) {
                        case "groups":
                        case "group_members":
                            queryClient.invalidateQueries({ queryKey: ["groups"] });
                            if (payload.new && "group_id" in payload.new) {
                                queryClient.invalidateQueries({
                                    queryKey: ["group", payload.new.group_id],
                                });
                            }
                            break;
                        case "expenses":
                        case "expense_splits":
                            if (payload.new && "group_id" in payload.new) {
                                queryClient.invalidateQueries({
                                    queryKey: ["expenses", payload.new.group_id],
                                });
                                queryClient.invalidateQueries({
                                    queryKey: ["group", payload.new.group_id],
                                });
                            }
                            queryClient.invalidateQueries({ queryKey: ["groups"] });
                            queryClient.invalidateQueries({ queryKey: ["recent-expenses"] });
                            break;
                        case "settlements":
                            if (payload.new && "group_id" in payload.new) {
                                queryClient.invalidateQueries({
                                    queryKey: ["settlements", payload.new.group_id],
                                });
                                queryClient.invalidateQueries({
                                    queryKey: ["group", payload.new.group_id],
                                });
                            }
                            break;
                        case "notifications":
                            queryClient.invalidateQueries({ queryKey: ["notifications"] });
                            break;
                        case "activity_log":
                            if (payload.new && "group_id" in payload.new) {
                                queryClient.invalidateQueries({
                                    queryKey: ["activity-log", "group", payload.new.group_id],
                                });
                            }
                            queryClient.invalidateQueries({
                                queryKey: ["activity-log", "recent"],
                            });
                            queryClient.invalidateQueries({
                                queryKey: ["activity-log", "recent"],
                            });
                            break;
                        case "debt_assignments":
                        case "debt_assignment_requests":
                            if (payload.new && "group_id" in payload.new) {
                                queryClient.invalidateQueries({
                                    queryKey: [
                                        options.table === "debt_assignments"
                                            ? "debt-assignment"
                                            : "debt-assignment-requests",
                                        payload.new.group_id,
                                    ],
                                });
                                queryClient.invalidateQueries({
                                    queryKey: ["group", payload.new.group_id],
                                });
                            }
                            break;
                    }

                    // Call custom handlers
                    switch (payload.eventType) {
                        case "INSERT":
                            options.onInsert?.(payload);
                            break;
                        case "UPDATE":
                            options.onUpdate?.(payload);
                            break;
                        case "DELETE":
                            options.onDelete?.(payload);
                            break;
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [options.table, options.filter]);
};

/**
 * Hook to subscribe to group changes
 */
export const useGroupRealtime = (groupId: string | null) => {
    useRealtime({
        table: "group_members",
        filter: groupId ? `group_id=eq.${groupId}` : undefined,
    });

    useRealtime({
        table: "expenses",
        filter: groupId ? `group_id=eq.${groupId}` : undefined,
    });

    useRealtime({
        table: "settlements",
        filter: groupId ? `group_id=eq.${groupId}` : undefined,
    });

    useRealtime({
        table: "debt_assignments",
        filter: groupId ? `group_id=eq.${groupId}` : undefined,
    });

    useRealtime({
        table: "debt_assignment_requests",
        filter: groupId ? `group_id=eq.${groupId}` : undefined,
    });
};

/**
 * Hook to subscribe to all groups the user belongs to
 */
export const useGroupsRealtime = () => {
    useRealtime({ table: "groups" });
    useRealtime({ table: "group_members" });
};

/**
 * Hook to subscribe to expenses changes for realtime updates
 * This enables the "Recent Activities" section to update in realtime
 */
export const useExpensesRealtime = () => {
    useRealtime({ table: "expenses" });
    useRealtime({ table: "expense_splits" });
};

/**
 * Hook to subscribe to notifications for realtime updates
 */
export const useNotificationsRealtime = () => {
    const queryClient = useQueryClient();
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        const setupSubscription = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase
                .channel("notifications-realtime")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "notifications",
                        filter: `user_id=eq.${user.id}`,
                    },
                    () => {
                        queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    }
                )
                .subscribe();

            channelRef.current = channel;
        };

        setupSubscription();

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [queryClient]);
};

/**
 * Hook to subscribe to activity log for realtime updates
 */
export const useActivityRealtime = () => {
    useRealtime({ table: "activity_log" });
};