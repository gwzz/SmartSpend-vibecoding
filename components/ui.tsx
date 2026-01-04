import React from 'react';

// iOS Style Grouped Card (White background, usually part of a list)
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}>
    {children}
  </div>
);

// iOS Badge
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'danger' | 'success' | 'outline' }> = ({ children, variant = 'default' }) => {
  let styles = "px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase";
  switch (variant) {
    case 'danger': styles += " bg-red-100 text-red-600"; break;
    case 'success': styles += " bg-green-100 text-green-600"; break;
    case 'outline': styles += " border border-slate-200 text-slate-500"; break;
    default: styles += " bg-slate-100 text-slate-600"; break;
  }
  return <span className={styles}>{children}</span>;
};

// iOS Button (Blue primary, opacity click effect instead of scale)
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }> = ({ className = '', variant = 'primary', ...props }) => {
  const base = "w-full py-3.5 rounded-xl font-semibold text-[17px] transition-opacity active:opacity-60 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#007AFF] text-white shadow-sm", // iOS Blue
    secondary: "bg-white text-slate-900 shadow-sm border border-slate-200",
    ghost: "bg-transparent text-[#007AFF]",
    danger: "bg-white text-red-500 shadow-sm border border-slate-200"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};

// iOS List Item Container
export const ListGroup: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
  <div className="mb-6">
    {title && <h3 className="text-[13px] uppercase text-slate-500 font-normal px-4 mb-2 ml-1">{title}</h3>}
    <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-slate-100/50">
      {children}
    </div>
  </div>
);

export const ListItem: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; isLast?: boolean }> = ({ children, className = '', onClick, isLast }) => (
  <div 
    onClick={onClick}
    className={`pl-4 bg-white ${onClick ? 'active:bg-slate-50 cursor-pointer' : ''} ${className}`}
  >
    <div className={`pr-4 py-3.5 flex items-center justify-between ${!isLast ? 'border-b border-slate-100' : ''}`}>
      {children}
    </div>
  </div>
);

// Floating Action Button
export const FloatingActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode }> = ({ onClick, icon }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-24 right-4 w-14 h-14 bg-[#007AFF] rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white active:scale-95 transition-transform z-50"
  >
    {icon}
  </button>
);

// Full Screen Modal / Bottom Sheet
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-md bg-[#F2F2F7] sm:rounded-2xl rounded-t-2xl shadow-2xl transform transition-transform duration-300 max-h-[92vh] flex flex-col">
        {/* Drag Handle (Visual only) */}
        <div className="w-full h-6 flex items-center justify-center pt-2 pb-1 bg-white rounded-t-2xl sm:hidden" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-white px-4 pb-3 pt-1 flex items-center justify-between border-b border-slate-100 sm:rounded-t-2xl">
          <button onClick={onClose} className="text-[#007AFF] text-[17px]">Cancel</button>
          <span className="font-semibold text-[17px]">{title}</span>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 pb-safe flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};