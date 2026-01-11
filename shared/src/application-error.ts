// Application error types

export interface BaseApplicationError {
    msg: string;
    stack?: string;
    path?: string;
    method?: string;
    cid?: string;
}

export interface DbApplicationError extends BaseApplicationError {
    id: number;
    created_at: Date;
}
