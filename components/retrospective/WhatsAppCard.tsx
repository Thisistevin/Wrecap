'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface WhatsAppCardProps {
  author: string;
  message: string;
  hour: string;
  isReceived?: boolean;
  delay?: number;
}

const WhatsAppCard = ({ author, message, hour, isReceived = true, delay = 0 }: WhatsAppCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !bubbleRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        delay,
        ease: 'power3.out',
      }
    );

    gsap.fromTo(
      bubbleRef.current,
      { 
        x: isReceived ? -30 : 30, 
        opacity: 0,
        scale: 0.8,
      },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        delay: delay + 0.3,
        ease: 'back.out(1.7)',
      }
    );
  }, [delay, isReceived]);

  return (
    <div
      ref={cardRef}
      className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-border"
      style={{
        backgroundImage: `url(/assets/whatsapp-bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* WhatsApp header */}
      <div className="bg-whatsapp-header px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center text-base sm:text-lg flex-shrink-0">
          {author.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs sm:text-sm text-whatsapp-header-text truncate">{author}</p>
          <p className="text-[10px] sm:text-xs text-whatsapp-header-text/70">online</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="p-3 sm:p-4 min-h-[120px] sm:min-h-[140px] flex flex-col justify-end">
        <div
          ref={bubbleRef}
          className={`max-w-[85%] ${isReceived ? 'self-start' : 'self-end'}`}
        >
            {/* Message bubble */}
            <div
              className={`rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 relative ${
                isReceived 
                  ? 'bg-whatsapp-bubble-received rounded-tl-none' 
                  : 'bg-whatsapp-bubble-sent rounded-tr-none'
              }`}
            >
              {/* Author name for received messages */}
              {isReceived && (
                <p className="text-[10px] sm:text-xs font-semibold text-whatsapp-author mb-1 truncate">{author}</p>
              )}
              
              {/* Message text */}
              <p className="text-xs sm:text-sm text-whatsapp-text leading-relaxed pr-10 sm:pr-12 break-words">
                {message}
              </p>
              
              {/* Time and checkmarks */}
              <div className="absolute bottom-1 sm:bottom-1.5 right-1.5 sm:right-2 flex items-center gap-0.5 sm:gap-1">
                <span className="text-[9px] sm:text-[10px] text-whatsapp-time">{hour}</span>
              {!isReceived && (
                <svg className="w-4 h-4 text-whatsapp-check" viewBox="0 0 16 15" fill="currentColor">
                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                </svg>
              )}
            </div>

            {/* Bubble tail */}
            <div
              className={`absolute top-0 w-3 h-3 ${
                isReceived 
                  ? '-left-2 bg-whatsapp-bubble-received' 
                  : '-right-2 bg-whatsapp-bubble-sent'
              }`}
              style={{
                clipPath: isReceived 
                  ? 'polygon(100% 0, 100% 100%, 0 0)' 
                  : 'polygon(0 0, 100% 0, 0 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppCard;

