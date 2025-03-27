import dayjs from "dayjs";

export const EMAIL_REGEX = /(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&-]{8,}$/;
export const MIN_BIRTHDAY = dayjs().subtract(125, "year");
export const MAX_BIRTHDAY = dayjs().subtract(18, "year");