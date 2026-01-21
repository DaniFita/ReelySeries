import logo from "@/assets/reelyseries-logo.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="ReelySeries"
            className="h-8 w-auto object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
            ReelySeries
          </span>
        </a>

        {/* Search REMOVED - search exists in Index controls */}
        <div />
      </div>
    </header>
  );
};

export default Header;
