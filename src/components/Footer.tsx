const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-10 px-6 mt-10 border-t border-white/10">
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          © {year} ReelySeries. All rights reserved.
        </p>

        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Contact
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;