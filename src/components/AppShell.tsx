import type { ReactNode } from "react";
import { MeshBackdrop } from "@/components/MeshBackdrop";

interface AppShellProps {
    toolbar: ReactNode;
    children: ReactNode;
    statusBar?: ReactNode;
}

export function AppShell({ toolbar, children, statusBar }: AppShellProps) {
    return (
        <>
            <MeshBackdrop />
            <div className="flex h-screen w-screen flex-col overflow-hidden p-3 md:p-4">
                <header className="glass shrink-0 rounded-2xl">{toolbar}</header>

                <main className="glass mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl">
                    {children}
                </main>

                {statusBar && (
                    <footer className="glass-subtle mt-3 shrink-0 rounded-xl">
                        {statusBar}
                    </footer>
                )}
            </div>
        </>
    );
}