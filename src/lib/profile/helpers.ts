import type { SessionUser } from '../types';
import type { ProfileUpdatePayload } from '../validation/profile';

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  nickname: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
}

export function sessionToFormValues(user: SessionUser): ProfileFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    nickname: user.nickname,
    addressLine1: user.addressLine1 ?? '',
    city: user.city ?? '',
    country: user.country ?? '',
    postalCode: user.postalCode ?? '',
  };
}

export function formValuesToPayload(
  values: ProfileFormValues,
): ProfileUpdatePayload {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    nickname: values.nickname,
    addressLine1: values.addressLine1,
    city: values.city,
    country: values.country,
    postalCode: values.postalCode,
  };
}
