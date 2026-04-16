import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

const TabsContext = createContext<{ value: string; onChange: (v: string) => void }>({ value: '', onChange: () => {} });

function Tabs({ defaultValue, value, onValueChange, className, children }: {
  defaultValue?: string; value?: string; onValueChange?: (v: string) => void;
  className?: string; children: React.ReactNode;
}) {
  const [internal, setInternal] = useState(defaultValue || '');
  const current = value ?? internal;
  const change = onValueChange ?? setInternal;
  return <TabsContext.Provider value={{ value: current, onChange: change }}><div className={className}>{children}</div></TabsContext.Provider>;
}

function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>{children}</div>;
}

function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const { value: current, onChange } = useContext(TabsContext);
  return (
    <button
      className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
        current === value ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50', className)}
      onClick={() => onChange(value)}
    >{children}</button>
  );
}

function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const { value: current } = useContext(TabsContext);
  if (current !== value) return null;
  return <div className={cn('mt-2', className)}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
