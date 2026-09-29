export interface FormState {
    error: string | null;
    savedAt: string | null;
}

export const emptyFormState: FormState = { error: null, savedAt: null };
