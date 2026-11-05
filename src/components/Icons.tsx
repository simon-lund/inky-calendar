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
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
    </Svg>
);
