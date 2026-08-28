export type PostActionState = {
  error: string | null;
  redirectTo: string | null;
};

export const initialPostActionState: PostActionState = {
  error: null,
  redirectTo: null,
};
