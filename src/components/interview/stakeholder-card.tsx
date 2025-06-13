import { Card, CardContent } from '@/components/ui/card';
import { Mic } from 'lucide-react';
import clsx from 'clsx';

interface StakeholderCardProps {
    /** Initials or short label to show inside the avatar circle */
    initials: string;
    /** Display name shown at the bottom left of the card */
    name: string;
    /** Whether the stakeholder is currently speaking */
    isSpeaking: boolean;
    /** Tailwind ring colour class e.g. `ring-green-500` */
    ringColorClass: string;
    /** Accent background colour for indicators (e.g. `bg-green-500`) */
    accentBgClass: string;
    /** Background for the placeholder area (e.g. `bg-gray-500`) */
    avatarBgClass: string;
    /** Background colour for the inner avatar circle (e.g. `bg-white/20`) */
    circleBgClass: string;
    /** Text colour for the initials (defaults to `text-white`) */
    avatarTextColorClass?: string;
    /** Show microphone indicator on the top-right (default: false) */
    showMic?: boolean;
}

/**
 * Reusable card component for displaying a participant (stakeholder) in the live interview.
 * Keeps visual consistency and allows easy theming by passing Tailwind colour classes.
 */
export function StakeholderCard({
    initials,
    name,
    isSpeaking,
    ringColorClass,
    accentBgClass,
    avatarBgClass,
    circleBgClass,
    avatarTextColorClass = 'text-white',
    showMic = false,
}: StakeholderCardProps) {
    return (
        <Card
            className={clsx(
                'relative overflow-hidden transition-all duration-300 p-0',
                isSpeaking && `ring-4 ${ringColorClass} shadow-lg`
            )}
        >
            <CardContent className="p-0 aspect-video relative">
                {/* Placeholder / Background */}
                <div
                    className={clsx(
                        'w-full h-full flex items-center justify-center',
                        avatarBgClass
                    )}
                >
                    {/* Avatar circle */}
                    <div
                        className={clsx(
                            'w-24 h-24 rounded-full flex items-center justify-center',
                            circleBgClass
                        )}
                    >
                        <span className={clsx('text-2xl font-bold', avatarTextColorClass)}>{initials}</span>
                    </div>
                </div>

                {/* Speaking indicator */}
                {isSpeaking && (
                    <div className="absolute top-4 left-4">
                        <div
                            className={clsx(
                                'flex items-center space-x-2 text-white px-3 py-1 rounded-full text-sm',
                                circleBgClass
                            )}
                        >
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span>Speaking</span>
                        </div>
                    </div>
                )}

                {/* Mic status (optional) */}
                {showMic && (
                    <div className="absolute top-4 right-4">
                        <div
                            className={clsx(
                                'p-2 rounded-full',
                                isSpeaking ? circleBgClass : accentBgClass
                            )}
                        >
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                    </div>
                )}

                {/* Name label */}
                <div className={clsx("absolute bottom-4 left-4 text-white px-3 py-1 rounded", circleBgClass)}>
                    {name}
                </div>
            </CardContent>
        </Card>
    );
} 