'use client';

import { useId, useState } from 'react';
import type { ChangeEvent, MutableRefObject, ReactElement } from 'react';
import { DEFAULT_PHONE_COUNTRY } from '@/lib/constants';
import { findPhoneCountry, phoneCountries } from '@/lib/phone-countries';
import { limitDigits, phoneFieldErrors, phoneErrorMessage, splitStoredPhone } from '@/lib/phone';

export function PhoneFields({
    initialPhone = '',
    validateRef,
}: {
    initialPhone?: string;
    validateRef?: MutableRefObject<(() => boolean) | null>;
}): ReactElement {
    const initialParts = splitStoredPhone(initialPhone);
    const [countryIso, setCountryIso] = useState(initialParts?.countryIso ?? DEFAULT_PHONE_COUNTRY);
    const [areaCode, setAreaCode] = useState(initialParts?.areaCode ?? '');
    const [localNumber, setLocalNumber] = useState(initialParts?.localNumber ?? '');
    const [areaTouched, setAreaTouched] = useState(false);
    const [localTouched, setLocalTouched] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const fieldId = useId();
    const country = findPhoneCountry(countryIso) ?? phoneCountries[0];
    const errors = phoneFieldErrors({ countryIso: country.iso, areaCode, localNumber });
    const areaError = showErrors || areaTouched ? errors.areaCode : null;
    const localError = showErrors || localTouched ? errors.localNumber : null;
    const countryError = showErrors ? errors.country : null;

    if (validateRef) {
        validateRef.current = function validatePhoneFields(): boolean {
            const message = phoneErrorMessage(
                phoneFieldErrors({ countryIso: country.iso, areaCode, localNumber }),
            );
            if (message) {
                setShowErrors(true);
                return false;
            }

            return true;
        };
    }

    function handleCountryChange(event: ChangeEvent<HTMLSelectElement>): void {
        const nextCountry = findPhoneCountry(event.target.value) ?? phoneCountries[0];
        setCountryIso(nextCountry.iso);
        setAreaCode((current) => limitDigits({ value: current, maxLength: nextCountry.areaCodeLength }));
        setLocalNumber((current) => limitDigits({ value: current, maxLength: nextCountry.localNumberLength }));
    }

    return (
        <div className={country.areaCodeLength > 0 ? 'phone-fields' : 'phone-fields phone-fields-no-area'}>
            <label className="phone-country" htmlFor={`${fieldId}-country`}>
                País
                <select
                    id={`${fieldId}-country`}
                    name="country"
                    value={country.iso}
                    onChange={handleCountryChange}
                    aria-invalid={Boolean(countryError)}
                >
                    {phoneCountries.map((option) => (
                        <option key={option.iso} value={option.iso}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {countryError ? <span className="field-error">{countryError}</span> : null}
            </label>
            <label htmlFor={`${fieldId}-dial`}>
                Código do país
                <input id={`${fieldId}-dial`} name="dialCode" value={`+${country.dialCode}`} readOnly />
            </label>
            {country.areaCodeLength > 0 ? (
                <label htmlFor={`${fieldId}-area`}>
                    DDD
                    <input
                        id={`${fieldId}-area`}
                        name="areaCode"
                        inputMode="numeric"
                        autoComplete="tel-area-code"
                        maxLength={country.areaCodeLength}
                        value={areaCode}
                        aria-invalid={Boolean(areaError)}
                        aria-describedby={areaError ? `${fieldId}-area-error` : undefined}
                        onBlur={() => setAreaTouched(true)}
                        onChange={(event) =>
                            setAreaCode(
                                limitDigits({
                                    value: event.target.value,
                                    maxLength: country.areaCodeLength,
                                }),
                            )
                        }
                    />
                    <span className="field-hint">{country.areaCodeLength} dígitos</span>
                    {areaError ? (
                        <span id={`${fieldId}-area-error`} className="field-error">
                            {areaError}
                        </span>
                    ) : null}
                </label>
            ) : null}
            <label className="phone-local" htmlFor={`${fieldId}-local`}>
                Telefone
                <input
                    id={`${fieldId}-local`}
                    name="localNumber"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={country.localNumberLength}
                    value={localNumber}
                    aria-invalid={Boolean(localError)}
                    aria-describedby={localError ? `${fieldId}-local-error` : undefined}
                    onBlur={() => setLocalTouched(true)}
                    onChange={(event) =>
                        setLocalNumber(
                            limitDigits({
                                value: event.target.value,
                                maxLength: country.localNumberLength,
                            }),
                        )
                    }
                />
                <span className="field-hint">{country.localNumberLength} dígitos</span>
                {localError ? (
                    <span id={`${fieldId}-local-error`} className="field-error">
                        {localError}
                    </span>
                ) : null}
            </label>
        </div>
    );
}
