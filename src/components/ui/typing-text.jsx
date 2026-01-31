import React, { useState, useEffect } from 'react';

/**
 * Types out text character by character with an optional blinking cursor.
 * @param {string} text - Full text to type
 * @param {number} speed - Ms per character (default 50)
 * @param {number} startDelay - Ms before typing starts (default 300)
 * @param {boolean} showCursor - Show blinking cursor (default true)
 * @param {string} className - Wrapper class name
 * @param {string} cursorChar - Cursor character (default "|")
 */
export function TypingText({
    text,
    speed = 50,
    startDelay = 300,
    showCursor = true,
    className = '',
    cursorChar = '|',
}) {
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) return;

        const startTimer = setTimeout(() => {
            let index = 0;
            setDisplayText('');
            setIsComplete(false);

            const typeInterval = setInterval(() => {
                if (index < text.length) {
                    setDisplayText(text.slice(0, index + 1));
                    index++;
                } else {
                    clearInterval(typeInterval);
                    setIsComplete(true);
                }
            }, speed);

            return () => clearInterval(typeInterval);
        }, startDelay);

        return () => clearTimeout(startTimer);
    }, [text, speed, startDelay]);

    const [cursorVisible, setCursorVisible] = useState(true);
    useEffect(() => {
        if (!showCursor || isComplete) return;
        const blink = setInterval(() => setCursorVisible((v) => !v), 530);
        return () => clearInterval(blink);
    }, [showCursor, isComplete]);

    return (
        <span className={className}>
            {displayText}
            {showCursor && !isComplete && (
                <span
                    className="inline-block w-0.5 align-baseline animate-pulse text-inherit"
                    aria-hidden="true"
                >
                    {cursorVisible ? cursorChar : '\u00A0'}
                </span>
            )}
        </span>
    );
}
