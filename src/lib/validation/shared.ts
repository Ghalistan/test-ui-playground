export const NICKNAME_PATTERN = /^[A-Za-z0-9._#-]+$/;
export const NICKNAME_MIN_LENGTH = 5;

export function validateNickname(
  value: string,
  required = true,
): string | undefined {
  const trimmed = value.trim();

  if (!trimmed && required) {
    return 'Nickname is required.';
  }

  if (
    trimmed &&
    (trimmed.length < NICKNAME_MIN_LENGTH || !NICKNAME_PATTERN.test(trimmed))
  ) {
    return 'Nickname must be at least 5 characters and can only use letters, numbers, ., -, _, or #.';
  }

  return undefined;
}
