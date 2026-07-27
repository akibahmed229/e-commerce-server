import { Failure } from "./Failure";
import { Success } from "./Success";

//  Combine (Success, Failure) into a single Result type
export type Result<T, E> = Success<T> | Failure<E>;

// Create helper functions to generate results
export const Result = {
    ok: <T>(value:T): Success<T> => ({ok:true, value}),
        fail: <E>(error:E): Failure<E> => ({ok:false, error})
}
