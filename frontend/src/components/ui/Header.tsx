interface HeaderProps {
    title?: string;
}

export const Header = ({ title = 'Tolk' }: HeaderProps) => {
    return (
        <header className="w-full border-b border-border bg-background/95 backdrop-blur-md">
            <nav className="max-w-5xl mx-auto flex justify-between items-center px-4 sm:px-6 h-14">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-sm">
                        <svg
                            className="w-4 h-4 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{title}</span>
                </div>
            </nav>
        </header>
    );
};
