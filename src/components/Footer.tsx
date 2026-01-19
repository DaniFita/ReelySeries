const Footer = () => {
  return (
    <footer className="px-6 py-12 mt-12 border-t border-border/30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-muted-foreground text-sm">
          © 2025 ReelySeries. All rights reserved.
        </p>
        
        <nav className="flex items-center gap-8">
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">
            About
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">
            Contact
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
