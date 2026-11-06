"use client";

import React, { useState } from 'react';

interface SettingsDialogProps {
    url: string;
    /** The server already has a feed configured (ICAL_URL). */
    hasServerUrl: boolean;
    onSave: (url: string) => void;
    onClose: () => void;
}

/** Where the events come from. Everything else about the calendar needs no setup. */
const SettingsDialog: React.FC<SettingsDialogProps> = ({ url, hasServerUrl, onSave, onClose }) => {
    const [value, setValue] = useState(url);

    return (
        <div
            className="absolute inset-0 z-40 flex items-center justify-center bg-white/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
        >
            <form
                className="w-full max-w-lg border border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave(value.trim());
                }}
            >
                <h2 id="settings-title" className="mb-1 text-lg font-bold">
                    Calendar feed
                </h2>
                <p className="mb-4 text-sm text-neutral-600">
                    Paste an iCal link to show your events. In Google Calendar: Settings → your calendar → Integrate
                    calendar → Secret address in iCal format. Leave it empty for a plain drawing calendar.
                </p>
                <input
                    autoFocus
                    type="url"
                    inputMode="url"
                    className="mb-2 h-12 w-full border border-black px-3"
                    placeholder={hasServerUrl ? 'Using the feed set on the server' : 'https://calendar.google.com/…/basic.ics'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" className="tool-button px-5" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="tool-button tool-button-active px-5">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsDialog;
