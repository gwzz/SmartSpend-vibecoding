import React from 'react';

// Glassy, friendly card used across dashboard/list surfaces
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-brand-card/80 backdrop-blur rounded-xl shadow-card border border-brand-border/80 ${className}`}>
    {children}
  </div>
);

// Rounded badge for labels and status chips
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'danger' | 'success' | 'outline' }> = ({ children, variant = 'default' }) => {
  let styles = "px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase";
  switch (variant) {
    case 'danger': styles += " bg-red-50 text-red-600 border border-red-100"; break;
    case 'success': styles += " bg-emerald-50 text-emerald-700 border border-emerald-100"; break;
    case 'outline': styles += " border border-brand-border text-brand-muted"; break;
    default: styles += " bg-brand-surface text-brand-ink border border-brand-border/80"; break;
  }
  return <span className={styles}>{children}</span>;
};

// Buttons with friendly rounded shape and clear focus states
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }> = ({ className = '', variant = 'primary', ...props }) => {
  const base = "w-full py-3.5 rounded-pill font-semibold text-[16px] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/50";
  const variants = {
    primary: "bg-gradient-to-r from-brand-accent to-brand-primary text-white shadow-soft hover:shadow-glass active:opacity-90", 
    secondary: "bg-brand-card text-brand-ink shadow-soft border border-brand-border hover:-translate-y-0.5", 
    ghost: "bg-transparent text-brand-primary hover:bg-brand-surface", 
    danger: "bg-brand-card text-red-600 shadow-soft border border-red-100 hover:bg-red-50"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};

// Grouping container for stacked list rows
export const ListGroup: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
  <div className="mb-6">
    {title && <h3 className="text-[13px] uppercase text-brand-muted font-medium px-4 mb-2 ml-1 tracking-wide">{title}</h3>}
    <div className="bg-brand-card/90 rounded-xl overflow-hidden shadow-soft border border-brand-border/70 backdrop-blur">
      {children}
    </div>
  </div>
);

export const ListItem: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; isLast?: boolean }> = ({ children, className = '', onClick, isLast }) => (
  <div 
    onClick={onClick}
    className={`pl-4 bg-transparent ${onClick ? 'cursor-pointer hover:bg-brand-surface transition-colors active:scale-[0.995]' : ''} ${className}`}
  >
    <div className={`pr-4 py-3.5 flex items-center justify-between ${!isLast ? 'border-b border-brand-border/60' : ''}`}>
      {children}
    </div>
  </div>
);

// Floating Action Button
export const FloatingActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode }> = ({ onClick, icon }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-brand-accent to-brand-primary rounded-full shadow-card flex items-center justify-center text-white active:scale-95 transition-all hover:shadow-glass hover:-translate-y-1 z-50"
  >
    {icon}
  </button>
);

// Full Screen Modal / Bottom Sheet
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-md bg-brand-surface sm:rounded-2xl rounded-t-2xl shadow-glass transform transition-transform duration-300 max-h-[92vh] flex flex-col sm:max-w-lg sm:max-h-[85vh] border border-brand-border/60">
        {/* Drag Handle (Visual only, mobile only) */}
        <div className="w-full h-6 flex items-center justify-center pt-2 pb-1 bg-brand-card rounded-t-2xl sm:hidden" onClick={onClose}>
          <div className="w-12 h-1.5 bg-brand-border rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-brand-card px-4 pb-3 pt-3 sm:pt-4 flex items-center justify-between border-b border-brand-border/70 sm:rounded-t-2xl">
          <button onClick={onClose} className="text-brand-primary text-[16px] hover:text-brand-accent font-semibold">Cancel</button>
          <span className="font-semibold text-[17px]" style={{ fontFamily: 'Poppins, Nunito, system-ui, sans-serif' }}>{title}</span>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 pb-safe flex-1 sm:rounded-b-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};