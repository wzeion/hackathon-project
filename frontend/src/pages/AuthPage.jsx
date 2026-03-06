import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Star,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { demoAdmin, demoBuyer, demoFarmer } from "../data/sampleData";
import {
  sampleInterests,
  sampleNotifications,
  sampleProducts,
} from "../data/sampleData";
import { useTranslation } from "../hooks/useTranslation";
import { useAppStore } from "../stores/appStore";
import { auth, googleProvider, initializeNotifications } from "../firebase";
import {
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import {
  firebaseLogin,
  updateProfile as updateProfileApi,
  signup,
  login,
  requestOTP,
  verifyOTP,
} from "../utils/api";

// ── Language options ──────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "khasi", label: "Khasi", native: "Khasi" },
  { code: "mizo", label: "Mizo", native: "Mizo" },
];

const demoAccounts = [
  {
    user: demoFarmer,
    label: "Farmer",
    color: "border-farm-green/20 hover:bg-farm-green-pale",
  },
  {
    user: demoBuyer,
    label: "Buyer",
    color: "border-farm-amber/20 hover:bg-farm-amber-pale",
  },
  {
    user: demoAdmin,
    label: "Admin",
    color: "border-muted-foreground/20 hover:bg-muted",
  },
];

const enter = { x: 20, opacity: 0 };
const center = { x: 0, opacity: 1 };
const exit = { x: -20, opacity: 0 };

export default function AuthPage() {
  console.log("AuthPage rendering");
  const { t } = useTranslation();
  const {
    setCurrentUser,
    setToken,
    setLanguage,
    setProducts,
    setInterests,
    setNotifications,
    language,
  } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [authMode, setAuthMode] = useState("phone"); // "phone" or "email"
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const otpRefs = useRef([]);

  // Function to save FCM token (best effort, non-blocking)
  const saveFcmToken = async () => {
    try {
      const fcmToken = await initializeNotifications();
      if (fcmToken) {
        console.log("FCM token acquired:", fcmToken);
      }
    } catch (fcmError) {
      console.warn("Failed to get FCM token:", fcmError);
    }
  };

  const validatePhone = () => {
    if (phone.length !== 10) {
      setPhoneError("Enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleStep1 = () => {
    handlePhoneSignIn();
  };

  const handleDemoLogin = (user) => {
    setCurrentUser(user);
    setProducts(sampleProducts);
    setInterests(sampleInterests);
    setNotifications(sampleNotifications);
    toast.success(`${t("auth.loginSuccess")} (${user.name})`);
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleStep3 = (selectedRole) => {
    setRole(selectedRole);
    setStep(4);
  };

  async function handleGoogleLogin() {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const data = await firebaseLogin(idToken);
      if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);

        // Save FCM token for notifications
        await saveFcmToken();

        toast.success(t("auth.loginSuccess"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePhoneSignIn() {
    if (!validatePhone()) return;
    try {
      setIsLoading(true);
      const data = await requestOTP(phone);
      if (data.success) {
        toast.success("OTP sent to your phone");
        setStep(2);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter the full 6-digit OTP");
      return;
    }
    try {
      setIsLoading(true);
      const data = await verifyOTP(phone, code);
      if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        await saveFcmToken();

        // If user already has profile details, skip role selection
        if (data.user.location && data.user.role) {
          toast.success(t("auth.loginSuccess"));
        } else {
          setStep(3);
        }
      }
    } catch (error) {
      console.error(error);
      setOtpError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailAuth() {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    try {
      setIsLoading(true);
      let data;
      if (isSignup) {
        data = await signup({
          name: "User",
          email,
          password,
          phone: "0000000000",
          role: "buyer",
        });
      } else {
        data = await login({ email, password });
      }

      if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        await saveFcmToken();
        toast.success(t("auth.loginSuccess"));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStep4() {
    if (!name.trim()) {
      setProfileError("Name is required");
      return;
    }
    if (!location.trim()) {
      setProfileError("Location is required");
      return;
    }
    setProfileError("");
    setIsLoading(true);

    try {
      // Update user profile on backend
      const profileData = {
        name: name.trim(),
        role: role,
        location: location.trim(),
      };
      const data = await updateProfileApi(profileData);
      if (data.success) {
        setCurrentUser(data.user);
      }
      toast.success(t("auth.loginSuccess"));
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete profile");
    } finally {
      setIsLoading(false);
    }
  }

  const stepVariants = {
    enter,
    center,
    exit,
  };

  return (
    <div className="max-h-screen flex flex-col md:flex-row">
      {/* ── Left panel: hero ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-10 overflow-hidden">
        <img
          src="src/assets/signup.png"
          alt="Farm landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-display font-bold text-xl tracking-tight">
            Local Connect
          </span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm">
            <Star className="w-3.5 h-3.5 fill-farm-amber text-farm-amber" />
            <span>Trusted by 10,000+ farmers</span>
          </div>
          <div className="bg-green-600/40 w-[60%] pl-5 rounded-[20px]">
            <h1 className="font-display text-4xl font-bold  text-white leading-tight">
            Connecting Farmers
            <br />
            <span className="text-farm-amber">Directly</span> to Buyers
          </h1>
          <p className="text-white/80 text-base max-w-sm leading-relaxed">
            Sell your harvest at fair prices. Reach buyers across India without
            middlemen. Available in English, Hindi, Khasi, and Mizo.
          </p>
          </div>
          <div className="flex gap-3 pt-2">
            {[
              { label: "Languages", value: "4" },
              { label: "States", value: "12+" },
              { label: "Crops", value: "50+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center"
              >
                <div className="font-display font-bold text-white text-xl">
                  {stat.value}
                </div>
                <div className="text-white/70 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: auth form ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 bg-background min-h-screen md:min-h-0">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">
            Local Connect
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── STEP 1 + Language ──────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {t("auth.welcome")}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {t("auth.subtitle")}
                  </p>
                </div>

                {/* Demo accounts */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("auth.demoAccounts")} — {t("auth.clickToLogin")}
                  </p>
                  <div className="grid gap-2">
                    {demoAccounts.map(({ user, label, color }) => (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => handleDemoLogin(user)}
                        className={`flex items-center justify-between w-full p-3 rounded-xl border text-left transition-all hover:shadow-sm active:scale-[0.99] ${color}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                            {label === "Farmer" ? (
                              <Sprout className="w-4 h-4 text-farm-green" />
                            ) : label === "Buyer" ? (
                              <ShoppingBag className="w-4 h-4 text-farm-amber" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-foreground">
                              {user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              +91 {user.phone}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 hover:bg-muted"
                  disabled={isLoading}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </Button>

                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${authMode === "phone" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => setAuthMode("phone")}
                  >
                    Phone
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${authMode === "email" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => setAuthMode("email")}
                  >
                    Email
                  </button>
                </div>

                {authMode === "email" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="signup-toggle"
                        checked={isSignup}
                        onChange={(e) => setIsSignup(e.target.checked)}
                      />
                      <Label htmlFor="signup-toggle" className="text-sm">
                        Create new account
                      </Label>
                    </div>
                    <Button
                      onClick={handleEmailAuth}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Wait..." : isSignup ? "Sign Up" : "Log In"}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-3 text-muted-foreground">
                          or sign in with phone
                        </span>
                      </div>
                    </div>

                    {/* Language selector */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-sm font-medium">
                        <Globe className="w-3.5 h-3.5" />
                        {t("auth.language")}
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            type="button"
                            key={lang.code}
                            onClick={() => {
                              setSelectedLang(lang.code);
                              setLanguage(lang.code);
                            }}
                            className={`py-2 px-1 rounded-lg border text-center text-xs font-medium transition-all ${
                              selectedLang === lang.code
                                ? "border-primary bg-farm-green-pale text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            <div className="text-sm">{lang.native}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Phone input */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="flex items-center gap-1.5 text-sm font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {t("auth.phone")}
                      </Label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 rounded-lg border border-input bg-muted text-sm font-medium text-muted-foreground select-none">
                          🇮🇳 +91
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={t("auth.phonePlaceholder")}
                          value={phone}
                          onChange={(e) => {
                            setPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            );
                            setPhoneError("");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                          maxLength={10}
                          className={phoneError ? "border-destructive" : ""}
                        />
                      </div>
                      {phoneError && (
                        <p className="text-xs text-destructive">{phoneError}</p>
                      )}
                    </div>

                    <div id="recaptcha-container"></div>

                    <Button
                      onClick={handlePhoneSignIn}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending OTP..." : t("auth.continue")}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {/* ── STEP 2 ──────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("auth.back")}
                </button>

                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {t("auth.enterOtp")}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {t("auth.otpSent")}{" "}
                    <span className="font-medium text-foreground">
                      +91 {phone}
                    </span>
                  </p>
                </div>

                {/* OTP input boxes */}
                <div className="flex gap-3 justify-center">
                  {["d0", "d1", "d2", "d3", "d4", "d5"].map((key, i) => (
                    <input
                      key={key}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i]}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 bg-card text-foreground transition-all outline-none focus:border-primary focus:bg-farm-green-pale ${
                        otp[i] ? "border-primary" : "border-input"
                      }`}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-xs text-destructive text-center">
                    {otpError}
                  </p>
                )}

                {/* Demo note */}
                <div className="bg-farm-amber-pale border border-farm-amber/30 rounded-xl p-3 text-center">
                  <p className="text-sm text-foreground/80">
                    <span className="font-medium">Demo:</span>{" "}
                    {t("auth.otpNote")}
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : t("auth.verifyOtp")}
                  <ShieldCheck className="w-4 h-4 ml-1.5" />
                </Button>

                <button
                  type="button"
                  onClick={() => toast.info("OTP resent (demo mode)")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("auth.resendOtp")}
                </button>
              </motion.div>
            )}

            {/* ── STEP 3 selection ────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("auth.back")}
                </button>

                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {t("auth.selectRole")}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    This determines your dashboard and features
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Farmer card */}
                  <button
                    type="button"
                    onClick={() => handleStep3("farmer")}
                    className="group relative flex items-start gap-4 p-5 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-farm-green-pale transition-all text-left shadow-sm hover:shadow-card"
                  >
                    <div className="w-12 h-12 rounded-xl bg-farm-green-pale group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                      <Sprout className="w-6 h-6 text-farm-green" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-foreground text-lg">
                        {t("auth.farmer")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {t("auth.farmerDesc")}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          "List products",
                          "Manage inventory",
                          "WhatsApp alerts",
                        ].map((feat) => (
                          <span
                            key={feat}
                            className="text-xs bg-farm-green-pale text-farm-green px-2 py-0.5 rounded-full"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-1 transition-colors" />
                  </button>

                  {/* Buyer card */}
                  <button
                    type="button"
                    onClick={() => handleStep3("buyer")}
                    className="group relative flex items-start gap-4 p-5 rounded-2xl border-2 border-border hover:border-secondary bg-card hover:bg-farm-amber-pale transition-all text-left shadow-sm hover:shadow-card"
                  >
                    <div className="w-12 h-12 rounded-xl bg-farm-amber-pale group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                      <ShoppingBag className="w-6 h-6 text-farm-amber" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-foreground text-lg">
                        {t("auth.buyer")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {t("auth.buyerDesc")}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          "Search crops",
                          "Filter by location",
                          "Contact farmers",
                        ].map((feat) => (
                          <span
                            key={feat}
                            className="text-xs bg-farm-amber-pale text-farm-earth px-2 py-0.5 rounded-full"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary mt-1 transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4 setup ─────────────────────────────── */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("auth.back")}
                </button>

                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {t("auth.setupProfile")}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Almost there! Just a few details
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="flex items-center gap-1.5 text-sm font-medium"
                    >
                      <User className="w-3.5 h-3.5" />
                      {t("auth.name")}
                    </Label>
                    <Input
                      id="name"
                      placeholder={t("auth.namePlaceholder")}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setProfileError("");
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-1.5 text-sm font-medium"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {t("auth.location")}
                    </Label>
                    <Input
                      id="location"
                      placeholder={t("auth.locationPlaceholder")}
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setProfileError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleStep4()}
                    />
                  </div>
                </div>

                {profileError && (
                  <p className="text-xs text-destructive">{profileError}</p>
                )}

                <Button
                  onClick={handleStep4}
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Get Started
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
