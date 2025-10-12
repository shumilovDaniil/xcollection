import React from 'react';

export const EddyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 6.25h-4.5a4.5 4.5 0 000 9h2.5a4.5 4.5 0 010 9H10.5"/>
      <path d="M12 2v20"/>
      <path d="M8 12h8"/>
    </svg>
);

export const DataChipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V8h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z"/>
    </svg>
);

// FIX: Added missing LustGemIcon component
export const LustGemIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.01 2.01c-.53 0-1.04.2-1.42.59l-8.03 8.03c-.78.78-.78 2.05 0 2.83l8.03 8.03c.39.39.9.59 1.42.59s1.03-.2 1.41-.59l8.03-8.03c.78-.78.78-2.05 0-2.83L13.42 2.6c-.38-.39-.89-.59-1.41-.59zm0 2.82 5.66 5.66L12.01 16.15 6.35 10.49l5.66-5.66z"/>
    </svg>
);

// FIX: Added missing StrengthIcon component
export const StrengthIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 17.5L20 22l-5-5.5-2-2-7 7-3-3 7-7-2-2L2 7l4.5 5.5Z"/>
        <path d="m18 2-6 6"/>
    </svg>
);

// FIX: Added missing HealingIcon component
export const HealingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

// FIX: Added missing HealthIcon component
export const HealthIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
);

// FIX: Added missing SpecialEffectIcon component
export const SpecialEffectIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);

// FIX: Added missing AttackRoleIcon component
export const AttackRoleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22.7,1.3,20,4l-2-2L15.9,4.1,13,1,9.9,3.9,7,1,4.1,3.9,1,1,3.9,3.9,1,7,3.9,9.9,1,13l2.9,2.9L1,18.8,3.8,21.7,6.7,19,9.5,21.8,12.4,19l2.8,2.8,2.9-2.8,2.8,2.8,2.8-2.8L23,17.2,20.2,14.3,23,11.5l-2.8-2.8L23,5.8Z"/>
    </svg>
);

// FIX: Added missing SupportRoleIcon component
export const SupportRoleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/>
    </svg>
);

// FIX: Added missing SortAscendingIcon component
export const SortAscendingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
    </svg>
);

// FIX: Added missing SortDescendingIcon component
export const SortDescendingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25 6.75l-3.75-3.75M17.25 21L21 17.25M17.25 21V3" />
    </svg>
);

export const AiAssistantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M16.5 12c0-1.93-1.57-3.5-3.5-3.5S9.5 10.07 9.5 12s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5zm-3.5 2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
);

export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);