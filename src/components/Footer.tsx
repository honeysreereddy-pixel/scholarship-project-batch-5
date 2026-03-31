import { GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer id="about" className="bg-primary py-14">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-navy-dark" />
              </div>
              <span className="font-display text-lg font-bold text-primary-foreground">ScholarHub</span>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Empowering students to discover and apply for scholarships through intelligent matching.
            </p>
          </div>
          {[
            { title: "Platform", links: ["Search", "AI Matching", "Applications", "Notifications"] },
            { title: "Support", links: ["Help Center", "Contact Us", "FAQs", "Chatbot"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm text-primary-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 text-center">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} ScholarHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
