import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import logo from "@/assets/reelyseries-logo.png";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    if (isSearchOpen && searchQuery) {
      // Handle search submission
      console.log("Searching for:", searchQuery);
    } else {
      setIsSearchOpen(!isSearchOpen);
      if (isSearchOpen) {
        setSearchQuery("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchQuery("");
    } else if (e.key === "Enter" && searchQuery) {
      console.log("Searching for:", searchQuery);
    }
  };

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

        {/* Search */}
        <div className="flex items-center">
          <div 
            className={`
              flex items-center gap-2 rounded-full transition-all duration-300 ease-out
              ${isSearchOpen 
                ? "w-64 bg-card/80 border border-border/60 px-4 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20" 
                : "w-10 h-10 justify-center hover:bg-card/60 cursor-pointer"
              }
            `}
          >
            <button
              onClick={handleSearchToggle}
              className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isSearchOpen ? "Submit search" : "Open search"}
            >
              <Search className="w-4 h-4" />
            </button>
            
            {isSearchOpen && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search movies & series..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
