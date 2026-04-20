import { Instagram } from 'lucide-react';
import React from 'react';

const WhatsAppIcon = ({ size = 22 }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M12.04 2.01C6.55 2.01 2.09 6.46 2.09 11.96c0 1.73.45 3.42 1.3 4.93L2 22l5.23-1.36a9.93 9.93 0 0 0 4.81 1.23h.01c5.49 0 9.95-4.46 9.95-9.95 0-2.66-1.04-5.16-2.92-7.04A9.88 9.88 0 0 0 12.04 2Zm0 18.15h-.01c-1.58 0-3.13-.43-4.48-1.24l-.32-.19-3.1.81.83-3.02-.21-.33a8.12 8.12 0 0 1-1.25-4.33c0-4.49 3.65-8.14 8.14-8.14 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.76c0 4.49-3.66 8.29-8.16 8.29Zm4.73-6.34c-.26-.13-1.54-.76-1.78-.84-.24-.09-.42-.13-.6.13-.18.26-.69.84-.84 1.02-.15.18-.31.2-.57.07-.26-.13-1.1-.4-2.1-1.28-.78-.7-1.31-1.57-1.47-1.83-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.43.13-.15.18-.26.26-.44.09-.18.04-.33-.02-.46-.07-.13-.6-1.44-.83-1.97-.22-.53-.44-.45-.6-.46h-.52c-.18 0-.46.07-.7.33-.24.26-.93.91-.93 2.22s.95 2.57 1.08 2.75c.13.18 1.89 2.89 4.58 4.05.64.28 1.14.44 1.54.56.65.21 1.24.18 1.7.11.52-.08 1.54-.63 1.76-1.24.22-.61.22-1.13.16-1.24-.07-.11-.24-.18-.5-.31Z" />
  </svg>
);

const socialLinks = [
  {
    name: 'WhatsApp',
    href: 'https://wa.me/923224841625',
    icon: WhatsAppIcon,
    className:
      'bg-[#25D366] text-white shadow-lg shadow-green-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-500/40',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/sportsworldccw',
    icon: Instagram,
    className:
      'bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg shadow-pink-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/35',
  },
];

const FloatingSocial = () => (
  <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
    {socialLinks.map(({ name, href, icon: Icon, className }) => (
      <a
        key={name}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={name}
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${className}`}
      >
        {React.createElement(Icon, { size: 22 })}
      </a>
    ))}
  </div>
);

export default FloatingSocial;
