'use client';

import Image from 'next/image';

const PoweredBy = () => {
  return (
    <a 
      href="https://wrecap.com.br" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1.5 mt-6 opacity-50 hover:opacity-80 transition-opacity"
    >
      <span className="text-[10px] text-muted-foreground">powered by</span>
      <Image 
        src="/assets/wrecap-logo.png" 
        alt="WRecap Logo" 
        width={60}
        height={15}
        className="h-3.5 w-auto dark:hidden"
        style={{ width: 'auto', height: 'auto' }}
      />
      <Image 
        src="/assets/wrecap-logo-dark.png" 
        alt="WRecap Logo" 
        width={60}
        height={15}
        className="h-3.5 w-auto hidden dark:block"
        style={{ width: 'auto', height: 'auto' }}
      />
    </a>
  );
};

export default PoweredBy;

