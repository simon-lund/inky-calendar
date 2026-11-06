import React from 'react';

// Tiny stroke icons, drawn on a 24px grid. They inherit the text colour.
const Svg = ({ children }: { children: React.ReactNode }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

export const PenIcon = () => (
    <Svg>
        <path d="M17 3l4 4L8 20l-5 1 1-5z" />
        <path d="M14 6l4 4" />
    </Svg>
);

export const EraserIcon = () => (
    <Svg>
        <path d="M20 20H9L3.5 14.5a2 2 0 010-2.8L12 3.2a2 2 0 012.8 0l5.5 5.5a2 2 0 010 2.8L11 20.5" />
        <path d="M7 11l6 6" />
    </Svg>
);

export const UndoIcon = () => (
    <Svg>
        <path d="M9 14L4 9l5-5" />
        <path d="M4 9h10a6 6 0 010 12h-3" />
    </Svg>
);

export const TrashIcon = () => (
    <Svg>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="M6 7l1 13h10l1-13" />
    </Svg>
);

export const ChevronLeftIcon = () => (
    <Svg>
        <path d="M15 5l-7 7 7 7" />
    </Svg>
);

export const ChevronRightIcon = () => (
    <Svg>
        <path d="M9 5l7 7-7 7" />
    </Svg>
);

export const ExpandIcon = () => (
    <Svg>
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </Svg>
);

export const GearIcon = () => (
    <Svg>
        <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </Svg>
);
