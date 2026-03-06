import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "About", href: "/about" },
  { name: "How It Works", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const farmerResources = [
  { name: "Sell Your Crops", href: "/add-product" },
  { name: "Pricing Guide", href: "/about" },
  { name: "Farmer Support", href: "/contact" },
  { name: "Help Center", href: "/contact" },
];

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com",
    color: "hover:text-blue-600",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com",
    color: "hover:text-pink-600",
  },
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://twitter.com",
    color: "hover:text-sky-500",
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    href: "https://whatsapp.com",
    color: "hover:text-green-500",
  },
];

const contactInfo = [
  {
    icon: Mail,
    text: "support@localconnect.in",
    href: "mailto:support@localconnect.in",
  },
  { icon: Phone, text: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: MapPin, text: "North-East India", href: "#" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-farm-green-pale/30 border-t border-border">
      {/* Top divider line */}
      <div className="h-1 bg-gradient-to-r from-farm-green via-farm-amber to-farm-green" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Local Connect
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting local farmers directly with buyers across North-East
              India. We ensure fair prices for farmers and fresh produce for
              consumers.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1 text-sm font-medium text-farm-green hover:text-farm-green/80 transition-colors group"
            >
              Learn more
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-farm-green transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-farm-green transition-all group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Farmer Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Farmer Resources</h3>
            <ul className="space-y-3">
              {farmerResources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-farm-amber transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-farm-amber transition-all group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact & Social</h3>

            {/* Contact Info */}
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <item.icon className="w-4 h-4 mt-0.5 text-farm-green group-hover:scale-110 transition-transform" />
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Icons */}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-3">Follow us</p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg bg-card border border-border text-muted-foreground ${social.color} transition-colors`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.name}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Local Connect — Empowering Farmers, Connecting
              Markets.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/about"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/about"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
