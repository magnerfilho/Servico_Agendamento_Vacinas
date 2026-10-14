import { MAX_PHONE_DIGITS, MIN_PHONE_DIGITS } from '@/lib/constants';
import { findPhoneCountry, phoneCountries, type PhoneCountry } from '@/lib/phone-countries';

export interface PhoneFieldErrors {
    country: string | null;
    areaCode: string | null;
    localNumber: string | null;
}

export interface StoredPhoneParts {
    countryIso: string;
    areaCode: string;
    localNumber: string;
}

const INCOMPLETE_AREA_CODE = 'O DDD está incompleto.';
const INCOMPLETE_LOCAL_NUMBER = 'O número está incompleto.';

export function normalizePhone(value: string): string {
    return value.replace(/\D/g, '');
}

export function isValidPhone(value: string): boolean {
    return value.length >= MIN_PHONE_DIGITS && value.length <= MAX_PHONE_DIGITS;
}

export function limitDigits({ value, maxLength }: { value: string; maxLength: number }): string {
    return normalizePhone(value).slice(0, maxLength);
}

export function phoneFieldErrors({
    countryIso,
    areaCode,
    localNumber,
}: {
    countryIso: string;
    areaCode: string;
    localNumber: string;
}): PhoneFieldErrors {
    const country = findPhoneCountry(countryIso);
    if (!country) {
        return {
            country: 'Selecione o país.',
            areaCode: null,
            localNumber: null,
        };
    }

    return {
        country: null,
        areaCode: areaCodeError({ country, areaCode: normalizePhone(areaCode) }),
        localNumber: localNumberError({ country, localNumber: normalizePhone(localNumber) }),
    };
}

export function phoneErrorMessage(errors: PhoneFieldErrors): string | null {
    const messages = [errors.country, errors.areaCode, errors.localNumber].filter(
        (message): message is string => Boolean(message),
    );

    if (messages.length === 0) {
        return null;
    }

    return messages.join(' ');
}

export function composePhoneNumber({
    countryIso,
    areaCode,
    localNumber,
}: {
    countryIso: string;
    areaCode: string;
    localNumber: string;
}): string | null {
    if (phoneErrorMessage(phoneFieldErrors({ countryIso, areaCode, localNumber }))) {
        return null;
    }

    const country = findPhoneCountry(countryIso);
    if (!country) {
        return null;
    }

    return `${country.dialCode}${normalizePhone(areaCode)}${normalizePhone(localNumber)}`;
}

export function splitStoredPhone(value: string): StoredPhoneParts | null {
    const digits = normalizePhone(value);
    const byLongestDialCode = [...phoneCountries].sort(
        (left, right) => right.dialCode.length - left.dialCode.length,
    );

    for (const country of byLongestDialCode) {
        if (!digits.startsWith(country.dialCode)) {
            continue;
        }

        const nationalNumber = digits.slice(country.dialCode.length);
        const areaCode = nationalNumber.slice(0, country.areaCodeLength);
        const localNumber = nationalNumber.slice(country.areaCodeLength);
        const errors = phoneFieldErrors({
            countryIso: country.iso,
            areaCode,
            localNumber,
        });

        if (phoneErrorMessage(errors)) {
            continue;
        }

        return {
            countryIso: country.iso,
            areaCode,
            localNumber,
        };
    }

    return null;
}

export function formatPhone(digits: string): string {
    const parts = splitStoredPhone(digits);
    if (!parts) {
        return `+${normalizePhone(digits)}`;
    }

    const country = findPhoneCountry(parts.countryIso);
    if (!country) {
        return `+${normalizePhone(digits)}`;
    }

    if (parts.areaCode) {
        return `+${country.dialCode} (${parts.areaCode}) ${parts.localNumber}`;
    }

    return `+${country.dialCode} ${parts.localNumber}`;
}

export function readWhatsappFromForm(formData: FormData): { whatsappNumber: string } | { error: string } {
    const countryIso = String(formData.get('country') ?? '').trim();
    if (!countryIso) {
        const whatsappNumber = normalizePhone(String(formData.get('whatsappNumber') ?? ''));
        if (!isValidPhone(whatsappNumber)) {
            return { error: 'Informe o WhatsApp com DDI, só números.' };
        }

        return { whatsappNumber };
    }

    const areaCode = normalizePhone(String(formData.get('areaCode') ?? ''));
    const localNumber = normalizePhone(String(formData.get('localNumber') ?? ''));
    const error = phoneErrorMessage(phoneFieldErrors({ countryIso, areaCode, localNumber }));
    if (error) {
        return { error };
    }

    const whatsappNumber = composePhoneNumber({ countryIso, areaCode, localNumber });
    if (!whatsappNumber) {
        return { error: INCOMPLETE_LOCAL_NUMBER };
    }

    return { whatsappNumber };
}

function areaCodeError({ country, areaCode }: { country: PhoneCountry; areaCode: string }): string | null {
    if (country.areaCodeLength === 0) {
        return null;
    }

    if (areaCode.length < country.areaCodeLength) {
        return INCOMPLETE_AREA_CODE;
    }

    if (areaCode.length > country.areaCodeLength) {
        return `O DDD precisa ter ${country.areaCodeLength} dígitos.`;
    }

    if (country.areaCodes && !country.areaCodes.includes(areaCode)) {
        return 'Esse DDD não é válido.';
    }

    return null;
}

function localNumberError({
    country,
    localNumber,
}: {
    country: PhoneCountry;
    localNumber: string;
}): string | null {
    if (localNumber.length < country.localNumberLength) {
        return INCOMPLETE_LOCAL_NUMBER;
    }

    if (localNumber.length > country.localNumberLength) {
        return `O telefone precisa ter ${country.localNumberLength} dígitos.`;
    }

    if (country.localPrefix && !localNumber.startsWith(country.localPrefix)) {
        return `O celular precisa começar com ${country.localPrefix}.`;
    }

    return null;
}
