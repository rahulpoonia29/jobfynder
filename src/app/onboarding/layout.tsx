import { ScrollArea } from "@/components/ui/scroll-area";

export default function GetStartedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ScrollArea className="h-svh w-svw">
            <div className="flex h-full w-full items-center justify-center bg-accent">
                {children}
            </div>
        </ScrollArea>
    );
}
