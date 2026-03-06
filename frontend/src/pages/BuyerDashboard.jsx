import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clock,
  Heart,
  IndianRupee,
  MapPin,
  Package,
  PhoneCall,
  ShoppingBag,
  Sprout,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "../hooks/useTranslation";
import { useAppStore } from "../stores/appStore";

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    pending: {
      cls: "badge-pending",
      icon: <Clock className="w-2.5 h-2.5" />,
      label: "Pending",
    },
    contacted: {
      cls: "badge-contacted",
      icon: <PhoneCall className="w-2.5 h-2.5" />,
      label: "Contacted",
    },
    closed: {
      cls: "badge-closed",
      icon: <XCircle className="w-2.5 h-2.5" />,
      label: "Closed",
    },
  };
  const { cls, icon, label } = config[status] ?? config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
}

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { currentUser, interests, products, setCurrentPage } = useAppStore();

  const myInterests = interests.filter((i) => i.buyerId === currentUser?.id);

  // Enrich interest with product data
  const enriched = myInterests.map((interest) => {
    const product = products.find((p) => p.id === interest.productId);
    return { interest, product };
  });

  const stats = {
    total: myInterests.length,
    pending: myInterests.filter((i) => i.status === "pending").length,
    contacted: myInterests.filter((i) => i.status === "contacted").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-12"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground">
          {t("nav.dashboard")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Track your product interests and connections
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            label: "Total Interests",
            value: stats.total,
            icon: <Heart className="w-5 h-5 text-farm-amber" />,
            bg: "bg-farm-amber/10"
          },
          {
            label: "Awaiting Reply",
            value: stats.pending,
            icon: <Clock className="w-5 h-5 text-yellow-600" />,
            bg: "bg-yellow-100/50"
          },
          {
            label: "Contacted",
            value: stats.contacted,
            icon: <PhoneCall className="w-5 h-5 text-primary" />,
            bg: "bg-primary/10"
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="bg-card border border-border/50 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-3 mx-auto`}>
              {stat.icon}
            </div>
            <div className="font-display font-bold text-2xl text-foreground">
              {stat.value}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-foreground">
          {t("interests.myInterests")}
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 rounded-xl gap-1.5 text-xs font-bold border-2 hover:bg-muted"
          onClick={() => setCurrentPage("marketplace")}
        >
          <ShoppingBag className="w-4 h-4" />
          Browse More
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Interests list */}
      {enriched.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center bg-muted/30 rounded-[3rem] border-2 border-dashed border-border/50"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-farm-amber-pale flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-farm-amber/60" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground">
            {t("interests.noInterests")}
          </h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs leading-relaxed">
            Browse the marketplace and express interest in products you want to buy.
          </p>
          <Button
            onClick={() => setCurrentPage("marketplace")}
            className="mt-8 px-8 h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold shadow-lg shadow-primary/20"
          >
            <ShoppingBag className="w-4 h-4" />
            Go to Marketplace
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {enriched.map(({ interest, product }, i) => (
              <motion.div
                key={interest.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border/50 rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="p-5">
                  <div className="flex items-start gap-5">
                    {/* Product image */}
                    {product && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-muted relative group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={product.imageUrl || "/artifacts/fresh_produce_basket_1772729731157.png"}
                          alt={product.cropName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23f0fdf4'/%3E%3Ctext x='28' y='36' text-anchor='middle' font-size='24'%3E🌿%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {interest.productName}
                          </h3>
                          {product && (
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground font-medium">
                              <span className="flex items-center gap-1.5">
                                <IndianRupee className="w-3 h-3 text-primary/60" />
                                {product.price}/kg
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Package className="w-3 h-3 text-primary/60" />
                                {product.quantity}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-primary/60" />
                                {product.location.split(",")[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <StatusBadge status={interest.status} />
                      </div>

                      {/* Message */}
                      <div className="mt-4 text-xs font-medium text-muted-foreground bg-muted/40 rounded-2xl p-4 italic group-hover:bg-muted/60 transition-colors">
                        &ldquo;{interest.message}&rdquo;
                      </div>

                      {/* Farmer info (when contacted) */}
                      {interest.status === "contacted" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl"
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                            <Sprout className="w-3.5 h-3.5" />
                            Farmer Connection Details
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <PhoneCall className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground">
                                {products.find((p) => p.id === interest.productId)?.farmerName ?? "Farmer"}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                The farmer will reach out to discuss your order.
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <Clock className="w-3 h-3" />
                        Expressed on{" "}
                        {new Date(interest.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Quick nav to marketplace */}
      {enriched.length > 0 && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="mt-8 bg-gradient-to-r from-farm-amber-pale to-farm-amber/5 border border-farm-amber/20 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="text-center sm:text-left">
            <p className="text-lg font-display font-bold text-foreground">
              Looking for more products?
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Browse fresh listings from farmers across India
            </p>
          </div>
          <Button
            onClick={() => setCurrentPage("marketplace")}
            className="h-12 px-8 rounded-2xl bg-farm-amber text-farm-earth hover:bg-farm-amber/90 gap-2 font-bold shadow-lg shadow-farm-amber/20 flex-shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            Go to Marketplace
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// suppress unused
void Badge;
void Sprout;
void AnimatePresence;
