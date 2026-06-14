import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActivityEvent, ForecastPoint, GamificationProfile, GetRecommendedSeatParams, HealthStatus, LeaderboardEntry, LibraryStats, LoginInput, LostFoundInput, LostFoundItem, MessageResponse, NoiseInput, NoiseZone, ProfileData, QueueEntry, QueueStatus, Seat, SeatRecommendation, User } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLoginUrl: () => string;
/**
 * @summary Log in
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<User>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Log in
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Log out
 */
export declare const logout: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Log out
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListSeatsUrl: () => string;
/**
 * @summary List all seats
 */
export declare const listSeats: (options?: RequestInit) => Promise<Seat[]>;
export declare const getListSeatsQueryKey: () => readonly ["/api/seats"];
export declare const getListSeatsQueryOptions: <TData = Awaited<ReturnType<typeof listSeats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSeats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSeats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSeatsQueryResult = NonNullable<Awaited<ReturnType<typeof listSeats>>>;
export type ListSeatsQueryError = ErrorType<unknown>;
/**
 * @summary List all seats
 */
export declare function useListSeats<TData = Awaited<ReturnType<typeof listSeats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSeats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRecommendedSeatUrl: (params?: GetRecommendedSeatParams) => string;
/**
 * @summary Get smart seat recommendation
 */
export declare const getRecommendedSeat: (params?: GetRecommendedSeatParams, options?: RequestInit) => Promise<SeatRecommendation>;
export declare const getGetRecommendedSeatQueryKey: (params?: GetRecommendedSeatParams) => readonly ["/api/seats/recommend", ...GetRecommendedSeatParams[]];
export declare const getGetRecommendedSeatQueryOptions: <TData = Awaited<ReturnType<typeof getRecommendedSeat>>, TError = ErrorType<void>>(params?: GetRecommendedSeatParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecommendedSeat>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecommendedSeat>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecommendedSeatQueryResult = NonNullable<Awaited<ReturnType<typeof getRecommendedSeat>>>;
export type GetRecommendedSeatQueryError = ErrorType<void>;
/**
 * @summary Get smart seat recommendation
 */
export declare function useGetRecommendedSeat<TData = Awaited<ReturnType<typeof getRecommendedSeat>>, TError = ErrorType<void>>(params?: GetRecommendedSeatParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecommendedSeat>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSeatUrl: (id: number) => string;
/**
 * @summary Get a seat
 */
export declare const getSeat: (id: number, options?: RequestInit) => Promise<Seat>;
export declare const getGetSeatQueryKey: (id: number) => readonly [`/api/seats/${number}`];
export declare const getGetSeatQueryOptions: <TData = Awaited<ReturnType<typeof getSeat>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSeat>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSeat>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSeatQueryResult = NonNullable<Awaited<ReturnType<typeof getSeat>>>;
export type GetSeatQueryError = ErrorType<void>;
/**
 * @summary Get a seat
 */
export declare function useGetSeat<TData = Awaited<ReturnType<typeof getSeat>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSeat>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCheckInUrl: (id: number) => string;
/**
 * @summary Check in to a seat
 */
export declare const checkIn: (id: number, options?: RequestInit) => Promise<Seat>;
export declare const getCheckInMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkIn>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof checkIn>>, TError, {
    id: number;
}, TContext>;
export type CheckInMutationResult = NonNullable<Awaited<ReturnType<typeof checkIn>>>;
export type CheckInMutationError = ErrorType<void>;
/**
* @summary Check in to a seat
*/
export declare const useCheckIn: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkIn>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof checkIn>>, TError, {
    id: number;
}, TContext>;
export declare const getMarkAwayUrl: (id: number) => string;
/**
 * @summary Mark seat as away
 */
export declare const markAway: (id: number, options?: RequestInit) => Promise<Seat>;
export declare const getMarkAwayMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAway>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAway>>, TError, {
    id: number;
}, TContext>;
export type MarkAwayMutationResult = NonNullable<Awaited<ReturnType<typeof markAway>>>;
export type MarkAwayMutationError = ErrorType<unknown>;
/**
* @summary Mark seat as away
*/
export declare const useMarkAway: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAway>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAway>>, TError, {
    id: number;
}, TContext>;
export declare const getCheckOutUrl: (id: number) => string;
/**
 * @summary Check out from a seat
 */
export declare const checkOut: (id: number, options?: RequestInit) => Promise<Seat>;
export declare const getCheckOutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkOut>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof checkOut>>, TError, {
    id: number;
}, TContext>;
export type CheckOutMutationResult = NonNullable<Awaited<ReturnType<typeof checkOut>>>;
export type CheckOutMutationError = ErrorType<unknown>;
/**
* @summary Check out from a seat
*/
export declare const useCheckOut: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkOut>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof checkOut>>, TError, {
    id: number;
}, TContext>;
export declare const getReleaseSeatUrl: (id: number) => string;
/**
 * @summary Release (admin) a seat
 */
export declare const releaseSeat: (id: number, options?: RequestInit) => Promise<Seat>;
export declare const getReleaseSeatMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof releaseSeat>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof releaseSeat>>, TError, {
    id: number;
}, TContext>;
export type ReleaseSeatMutationResult = NonNullable<Awaited<ReturnType<typeof releaseSeat>>>;
export type ReleaseSeatMutationError = ErrorType<unknown>;
/**
* @summary Release (admin) a seat
*/
export declare const useReleaseSeat: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof releaseSeat>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof releaseSeat>>, TError, {
    id: number;
}, TContext>;
export declare const getReportNoiseUrl: (id: number) => string;
/**
 * @summary Report noise level at a seat
 */
export declare const reportNoise: (id: number, noiseInput: NoiseInput, options?: RequestInit) => Promise<MessageResponse>;
export declare const getReportNoiseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reportNoise>>, TError, {
        id: number;
        data: BodyType<NoiseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof reportNoise>>, TError, {
    id: number;
    data: BodyType<NoiseInput>;
}, TContext>;
export type ReportNoiseMutationResult = NonNullable<Awaited<ReturnType<typeof reportNoise>>>;
export type ReportNoiseMutationBody = BodyType<NoiseInput>;
export type ReportNoiseMutationError = ErrorType<unknown>;
/**
* @summary Report noise level at a seat
*/
export declare const useReportNoise: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reportNoise>>, TError, {
        id: number;
        data: BodyType<NoiseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof reportNoise>>, TError, {
    id: number;
    data: BodyType<NoiseInput>;
}, TContext>;
export declare const getGetNoiseHeatmapUrl: () => string;
/**
 * @summary Get noise heatmap for all zones
 */
export declare const getNoiseHeatmap: (options?: RequestInit) => Promise<NoiseZone[]>;
export declare const getGetNoiseHeatmapQueryKey: () => readonly ["/api/noise/heatmap"];
export declare const getGetNoiseHeatmapQueryOptions: <TData = Awaited<ReturnType<typeof getNoiseHeatmap>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getNoiseHeatmap>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getNoiseHeatmap>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetNoiseHeatmapQueryResult = NonNullable<Awaited<ReturnType<typeof getNoiseHeatmap>>>;
export type GetNoiseHeatmapQueryError = ErrorType<unknown>;
/**
 * @summary Get noise heatmap for all zones
 */
export declare function useGetNoiseHeatmap<TData = Awaited<ReturnType<typeof getNoiseHeatmap>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getNoiseHeatmap>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetStatsUrl: () => string;
/**
 * @summary Get library statistics
 */
export declare const getStats: (options?: RequestInit) => Promise<LibraryStats>;
export declare const getGetStatsQueryKey: () => readonly ["/api/stats"];
export declare const getGetStatsQueryOptions: <TData = Awaited<ReturnType<typeof getStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getStats>>>;
export type GetStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get library statistics
 */
export declare function useGetStats<TData = Awaited<ReturnType<typeof getStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetOccupancyForecastUrl: () => string;
/**
 * @summary Get occupancy forecast for next 8 hours
 */
export declare const getOccupancyForecast: (options?: RequestInit) => Promise<ForecastPoint[]>;
export declare const getGetOccupancyForecastQueryKey: () => readonly ["/api/stats/forecast"];
export declare const getGetOccupancyForecastQueryOptions: <TData = Awaited<ReturnType<typeof getOccupancyForecast>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOccupancyForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOccupancyForecast>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOccupancyForecastQueryResult = NonNullable<Awaited<ReturnType<typeof getOccupancyForecast>>>;
export type GetOccupancyForecastQueryError = ErrorType<unknown>;
/**
 * @summary Get occupancy forecast for next 8 hours
 */
export declare function useGetOccupancyForecast<TData = Awaited<ReturnType<typeof getOccupancyForecast>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOccupancyForecast>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListActivityUrl: () => string;
/**
 * @summary List recent activity
 */
export declare const listActivity: (options?: RequestInit) => Promise<ActivityEvent[]>;
export declare const getListActivityQueryKey: () => readonly ["/api/activity"];
export declare const getListActivityQueryOptions: <TData = Awaited<ReturnType<typeof listActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListActivityQueryResult = NonNullable<Awaited<ReturnType<typeof listActivity>>>;
export type ListActivityQueryError = ErrorType<unknown>;
/**
 * @summary List recent activity
 */
export declare function useListActivity<TData = Awaited<ReturnType<typeof listActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetProfileUrl: () => string;
/**
 * @summary Get user profile
 */
export declare const getProfile: (options?: RequestInit) => Promise<ProfileData>;
export declare const getGetProfileQueryKey: () => readonly ["/api/profile"];
export declare const getGetProfileQueryOptions: <TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getProfile>>>;
export type GetProfileQueryError = ErrorType<unknown>;
/**
 * @summary Get user profile
 */
export declare function useGetProfile<TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getJoinQueueUrl: () => string;
/**
 * @summary Join the seat waitlist
 */
export declare const joinQueue: (options?: RequestInit) => Promise<QueueStatus>;
export declare const getJoinQueueMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof joinQueue>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof joinQueue>>, TError, void, TContext>;
export type JoinQueueMutationResult = NonNullable<Awaited<ReturnType<typeof joinQueue>>>;
export type JoinQueueMutationError = ErrorType<void>;
/**
* @summary Join the seat waitlist
*/
export declare const useJoinQueue: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof joinQueue>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof joinQueue>>, TError, void, TContext>;
export declare const getLeaveQueueUrl: () => string;
/**
 * @summary Leave the seat waitlist
 */
export declare const leaveQueue: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLeaveQueueMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof leaveQueue>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof leaveQueue>>, TError, void, TContext>;
export type LeaveQueueMutationResult = NonNullable<Awaited<ReturnType<typeof leaveQueue>>>;
export type LeaveQueueMutationError = ErrorType<unknown>;
/**
* @summary Leave the seat waitlist
*/
export declare const useLeaveQueue: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof leaveQueue>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof leaveQueue>>, TError, void, TContext>;
export declare const getGetQueueStatusUrl: () => string;
/**
 * @summary Get queue position and status
 */
export declare const getQueueStatus: (options?: RequestInit) => Promise<QueueStatus>;
export declare const getGetQueueStatusQueryKey: () => readonly ["/api/queue/status"];
export declare const getGetQueueStatusQueryOptions: <TData = Awaited<ReturnType<typeof getQueueStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQueueStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getQueueStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetQueueStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getQueueStatus>>>;
export type GetQueueStatusQueryError = ErrorType<unknown>;
/**
 * @summary Get queue position and status
 */
export declare function useGetQueueStatus<TData = Awaited<ReturnType<typeof getQueueStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQueueStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListQueueUrl: () => string;
/**
 * @summary (Admin) List full queue
 */
export declare const listQueue: (options?: RequestInit) => Promise<QueueEntry[]>;
export declare const getListQueueQueryKey: () => readonly ["/api/queue"];
export declare const getListQueueQueryOptions: <TData = Awaited<ReturnType<typeof listQueue>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQueue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQueue>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQueueQueryResult = NonNullable<Awaited<ReturnType<typeof listQueue>>>;
export type ListQueueQueryError = ErrorType<unknown>;
/**
 * @summary (Admin) List full queue
 */
export declare function useListQueue<TData = Awaited<ReturnType<typeof listQueue>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQueue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetGamificationProfileUrl: () => string;
/**
 * @summary Get user badges, streaks, and achievements
 */
export declare const getGamificationProfile: (options?: RequestInit) => Promise<GamificationProfile>;
export declare const getGetGamificationProfileQueryKey: () => readonly ["/api/gamification/profile"];
export declare const getGetGamificationProfileQueryOptions: <TData = Awaited<ReturnType<typeof getGamificationProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGamificationProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGamificationProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGamificationProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getGamificationProfile>>>;
export type GetGamificationProfileQueryError = ErrorType<unknown>;
/**
 * @summary Get user badges, streaks, and achievements
 */
export declare function useGetGamificationProfile<TData = Awaited<ReturnType<typeof getGamificationProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGamificationProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetLeaderboardUrl: () => string;
/**
 * @summary Get weekly study leaderboard
 */
export declare const getLeaderboard: (options?: RequestInit) => Promise<LeaderboardEntry[]>;
export declare const getGetLeaderboardQueryKey: () => readonly ["/api/gamification/leaderboard"];
export declare const getGetLeaderboardQueryOptions: <TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLeaderboardQueryResult = NonNullable<Awaited<ReturnType<typeof getLeaderboard>>>;
export type GetLeaderboardQueryError = ErrorType<unknown>;
/**
 * @summary Get weekly study leaderboard
 */
export declare function useGetLeaderboard<TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListLostFoundUrl: () => string;
/**
 * @summary List lost and found items
 */
export declare const listLostFound: (options?: RequestInit) => Promise<LostFoundItem[]>;
export declare const getListLostFoundQueryKey: () => readonly ["/api/lost-found"];
export declare const getListLostFoundQueryOptions: <TData = Awaited<ReturnType<typeof listLostFound>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLostFound>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listLostFound>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListLostFoundQueryResult = NonNullable<Awaited<ReturnType<typeof listLostFound>>>;
export type ListLostFoundQueryError = ErrorType<unknown>;
/**
 * @summary List lost and found items
 */
export declare function useListLostFound<TData = Awaited<ReturnType<typeof listLostFound>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLostFound>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getReportLostFoundUrl: () => string;
/**
 * @summary Report a lost item at a desk
 */
export declare const reportLostFound: (lostFoundInput: LostFoundInput, options?: RequestInit) => Promise<LostFoundItem>;
export declare const getReportLostFoundMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reportLostFound>>, TError, {
        data: BodyType<LostFoundInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof reportLostFound>>, TError, {
    data: BodyType<LostFoundInput>;
}, TContext>;
export type ReportLostFoundMutationResult = NonNullable<Awaited<ReturnType<typeof reportLostFound>>>;
export type ReportLostFoundMutationBody = BodyType<LostFoundInput>;
export type ReportLostFoundMutationError = ErrorType<unknown>;
/**
* @summary Report a lost item at a desk
*/
export declare const useReportLostFound: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reportLostFound>>, TError, {
        data: BodyType<LostFoundInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof reportLostFound>>, TError, {
    data: BodyType<LostFoundInput>;
}, TContext>;
export declare const getClaimLostFoundUrl: (id: number) => string;
/**
 * @summary Mark an item as claimed
 */
export declare const claimLostFound: (id: number, options?: RequestInit) => Promise<LostFoundItem>;
export declare const getClaimLostFoundMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof claimLostFound>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof claimLostFound>>, TError, {
    id: number;
}, TContext>;
export type ClaimLostFoundMutationResult = NonNullable<Awaited<ReturnType<typeof claimLostFound>>>;
export type ClaimLostFoundMutationError = ErrorType<unknown>;
/**
* @summary Mark an item as claimed
*/
export declare const useClaimLostFound: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof claimLostFound>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof claimLostFound>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map