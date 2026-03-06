import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import api from "@/utils/api";
import { useAppStore } from "../stores/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sprout,
  Upload,
  ChevronLeft,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function AddProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addProduct, currentUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropName: "",
    price: "",
    quantity: "",
    location: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0)
      return toast.error("Please upload at least one image");

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    images.forEach((image) => data.append("images", image));

    try {
      const response = await api.post("/posts/create", data);

      if (response.data.success && response.data.post) {
        // Add the new post to the global store immediately
        addProduct(response.data.post);
        toast.success(t("products.listingAdded"));
        // Navigate to marketplace to see the new post
        navigate("/marketplace");
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.error || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-6 max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-8 hover:bg-muted rounded-xl"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        {t("auth.back")}
      </Button>

      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Sprout className="w-8 h-8" />
            </div>
            {t("products.addListing")}
          </h1>
          <p className="text-muted-foreground text-lg italic">
            "Every fresh listing is a bridge to a hungry table."
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-card p-8 rounded-[2.5rem] border border-border shadow-xl"
        >
          {/* Image Upload Area */}
          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Product Images
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previews.map((preview, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-border group"
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold text-center px-2">
                  {t("products.uploadImage")}
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("products.cropName")}
              </label>
              <Input
                required
                value={formData.cropName}
                onChange={(e) =>
                  setFormData({ ...formData, cropName: e.target.value })
                }
                placeholder={t("products.cropNamePlaceholder")}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("products.price")}
              </label>
              <Input
                required
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="₹ per kg"
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("products.quantity")}
              </label>
              <Input
                required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder={t("products.quantityPlaceholder")}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("products.location")}
              </label>
              <Input
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder={t("products.locationPlaceholder")}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("products.description")}
            </label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t("products.descriptionPlaceholder")}
              className="min-h-[120px] rounded-2xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {t("products.save")}
          </Button>
        </form>
      </div>
    </div>
  );
}
