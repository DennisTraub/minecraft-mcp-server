export type ErrorResult = { success: false; error: string; }
export type Result = { success: true; } | ErrorResult;

export const resultFrom = (error: Error): ErrorResult => ({ 
    success: false, 
    error: error.message 
});
