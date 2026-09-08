import React from 'react';

interface NewTabLayoutProps {
  wallpaper: React.ReactNode;
  header: React.ReactNode;
  main: React.ReactNode;
  footer: React.ReactNode;
  settingsModal: React.ReactNode;
  themeClass: string;
  fontClass: string;
}

export const NewTabLayout: React.FC<NewTabLayoutProps> = ({
  wallpaper,
  header,
  main,
  footer,
  settingsModal,
  themeClass,
  fontClass,
}) => {
  return (
    <div className={`relative w-screen h-screen overflow-hidden flex flex-col justify-between p-6 md:p-8 text-white ${themeClass} ${fontClass}`}>
      {/* Background wallpaper layer */}
      {wallpaper}

      {/* Header controls bar */}
      <header className="relative z-20 flex items-center justify-between w-full max-w-7xl mx-auto">
        {header}
      </header>

      {/* Main centerpiece dashboard */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full my-auto text-center px-4">
        {main}
      </main>

      {/* Footer bar */}
      <footer className="relative z-20 flex items-center justify-between w-full max-w-7xl mx-auto pt-4">
        {footer}
      </footer>

      {/* Settings Modal Drawer */}
      {settingsModal}
    </div>
  );
};
