import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin, Package, Send, User } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "../hooks/useTranslation";
import { getFallbackImage, DEFAULT_FALLBACK } from "../utils/fallbackImages";

/**
 * PostCard - Reusable component for displaying marketplace listings
 *
 * @param {Object} product - The product/post data
 * @param {Function} onView - Callback when View button is clicked
 * @param {Function} onInterested - Callback when Contact button is clicked
 * @param {boolean} isOwner - Whether current user owns this post
 * @param {boolean} isBuyer - Whether current user is a buyer
 * @param {Object} currentUser - Current logged in user object
 */
export default function PostCard({
  product,
  onView,
  onInterested,
  isOwner = false,
  isBuyer = false,
  currentUser = null,
}) {
  const { t } = useTranslation();

  // Get crop-specific fallback image for North East Indian agriculture
  const cropSpecificFallback = getFallbackImage(product.cropName);

  // Handle multiple image sources for compatibility
  const imageSrc =
    product.image ||
    product.images?.[0] ||
    product.imageUrl ||
    cropSpecificFallback;

  // Handle quantity display
  const quantityDisplay = product.quantity
    ? typeof product.quantity === "number"
      ? `${product.quantity} kg`
      : product.quantity
    : "N/A";

  // Handle farmer name from various sources
  const farmerName =
    product.userId?.name || product.farmerName || "Unknown Farmer";

  // Handle status
  const isActive = product.status === "active";

  const handleImageError = (e) => {
    // Try a crop-specific fallback image on error
    e.currentTarget.src = getFallbackImage(product.cropName);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group bg-card rounded-[2rem] border border-border/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-300 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={imageSrc}
          alt={product.cropName || "Farm product"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={handleImageError}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 scale-90 origin-top-right">
          <Badge className="bg-white/90 backdrop-blur-md text-primary hover:bg-white font-bold px-3 py-1 rounded-full shadow-sm">
            ₹{product.price}/{t("products.kg")}
          </Badge>
          <Badge
            className={`backdrop-blur-md border-0 px-3 py-1 rounded-full font-bold shadow-sm ${
              isActive ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"
            }`}
          >
            {isActive ? t("products.active") : t("products.sold")}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.cropName}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {product.description || "No description available"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-muted/30">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold leading-none mb-1">
              Quantity
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Package className="w-3 h-3 text-primary/60" />
              {quantityDisplay}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold leading-none mb-1">
              Location
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <MapPin className="w-3 h-3 text-primary/60" />
              <span className="truncate">{product.location || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Farmer Info */}
        <div className="flex items-center gap-2 border-t border-border pt-4">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-bold text-muted-foreground truncate">
            {farmerName}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView && onView(product)}
            className="flex-1 h-9 text-[11px] gap-1.5 rounded-xl border-2 hover:bg-muted font-bold"
          >
            <Eye className="w-3.5 h-3.5" />
            {t("products.viewDetail")}
          </Button>
          {isBuyer && isActive && !isOwner && (
            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
              <Button
                size="sm"
                onClick={() => onInterested && onInterested(product)}
                className="w-full h-9 text-[11px] gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                <Send className="w-3.5 h-3.5" />
                {t("products.interested")}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
