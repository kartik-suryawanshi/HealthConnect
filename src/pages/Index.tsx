import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/SettingsDialog";
import { 
  Heart, 
  User, 
  Stethoscope, 
  Shield, 
  FileText, 
  Lock, 
  Activity,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Clock,
  Award
} from "lucide-react";

export default function Index() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const features = [
    {
      icon: FileText,
      title: "Centralized Records",
      description: "Store all your medical documents in one secure location. Lab results, prescriptions, scans, and reports.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Shield,
      title: "Granular Access Control",
      description: "Decide exactly who can see your records. Grant, modify, or revoke access at any time.",
      color: "from-teal-500 to-cyan-600",
    },
    {
      icon: Lock,
      title: "Complete Audit Trail",
      description: "Track every access to your records. Know who viewed what and when.",
      color: "from-cyan-500 to-emerald-600",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: User },
    { value: "99.9%", label: "Uptime", icon: Zap },
    { value: "50+", label: "Hospitals", icon: Globe },
    { value: "24/7", label: "Support", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        {/* Animated Circles */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-primary/10 to-transparent blur-3xl transition-transform duration-1000 ease-out"
          style={{
            left: mousePosition.x * 0.02 - 300,
            top: mousePosition.y * 0.02 - 300,
          }}
        />
        <div 
          className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-accent/10 to-transparent blur-3xl transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        
        {/* Floating Medical Icons */}
        <div className="absolute top-1/4 left-[10%] animate-float-slow opacity-10">
          <Heart className="w-16 h-16 text-primary" />
        </div>
        <div className="absolute top-1/3 right-[15%] animate-float-medium opacity-10">
          <Activity className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute bottom-1/4 left-[20%] animate-float-fast opacity-10">
          <Stethoscope className="w-14 h-14 text-primary" />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 transition-transform group-hover:scale-110">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Digital Health Records
              </h1>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {["features", "security", "about"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted rounded-lg capitalize"
              >
                {section}
              </button>
            ))}
            <div className="ml-2 h-6 w-px bg-border" />
            <ThemeToggle />
            <Button asChild size="sm" className="ml-2">
              <Link to="/patient">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 md:py-32">
        <div 
          className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-5 py-2 shadow-lg shadow-primary/5">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trusted by 10,000+ Healthcare Providers
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl leading-[1.1]">
            Your Health Data,
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Your Control
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" fill="none">
                <path 
                  d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" 
                  stroke="url(#underline-gradient)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="animate-draw-line"
                />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(160 93% 31%)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="mt-8 text-xl text-muted-foreground md:text-2xl max-w-2xl mx-auto leading-relaxed">
            The <span className="text-foreground font-semibold">secure</span> and{" "}
            <span className="text-foreground font-semibold">transparent</span> way to manage 
            your medical records and control who accesses them.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button 
              asChild 
              size="xl" 
              className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-xl shadow-primary/25"
            >
              <Link to="/patient">
                <User className="mr-2 h-5 w-5" />
                Patient Portal
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className="w-full sm:w-auto border-2 hover:bg-primary/5 hover:border-primary/50"
            >
              <Link to="/doctor">
                <Stethoscope className="mr-2 h-5 w-5" />
                Doctor Portal
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            {[
              "HIPAA Compliant",
              "256-bit Encryption",
              "SOC 2 Certified",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Stats Cards */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <stat.icon className="h-6 w-6 mx-auto mb-3 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              <p className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Features Section */}
      <section id="features" className="relative py-24 scroll-mt-16">
        {/* Diagonal Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                currentColor 20px,
                currentColor 21px
              )`,
            }}
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Features</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">
              Complete Health Record
              <br />
              <span className="text-primary">Management</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Everything you need to manage, share, and protect your health information.
            </p>
          </div>

          {/* Feature Cards with Tabs */}
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Feature Selector */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeFeature === index;
                return (
                  <button
                    key={feature.title}
                    onClick={() => setActiveFeature(index)}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isActive
                        ? "border-primary bg-gradient-to-r from-primary/10 to-accent/5 shadow-lg shadow-primary/10"
                        : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive 
                          ? "bg-gradient-to-br from-primary to-emerald-600 text-white" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold transition-colors ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {feature.title}
                        </h3>
                        <p className={`mt-2 text-sm transition-colors ${
                          isActive ? "text-muted-foreground" : "text-muted-foreground/70"
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    {isActive && (
                      <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-emerald-500 animate-progress-bar" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feature Visualization */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-8 shadow-2xl shadow-primary/10">
                {/* Animated Hexagon Grid */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-xl bg-primary/30 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Feature Icon */}
                <div className="relative h-full flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                    {(() => {
                      const ActiveIcon = features[activeFeature].icon;
                      return (
                        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 shadow-2xl">
                          <ActiveIcon className="h-16 w-16 text-white" />
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-foreground/70">Live & Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative py-24 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Security Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden relative">
                {/* Animated Lock Visual */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-teal-900/90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Orbiting Rings */}
                    <div className="absolute inset-0 -m-20">
                      <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
                      <div className="absolute inset-4 rounded-full border border-white/10 animate-spin-slow-reverse" />
                      <div className="absolute inset-8 rounded-full border border-white/10 animate-spin-slow" />
                    </div>
                    
                    {/* Center Lock */}
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 shadow-2xl shadow-primary/50">
                      <Lock className="h-14 w-14 text-white" />
                    </div>

                    {/* Floating Security Badges */}
                    <div className="absolute -top-8 -right-8 rounded-xl bg-white/10 backdrop-blur-sm px-3 py-2 animate-float-slow">
                      <span className="text-xs font-bold text-white">AES-256</span>
                    </div>
                    <div className="absolute -bottom-6 -left-10 rounded-xl bg-white/10 backdrop-blur-sm px-3 py-2 animate-float-medium">
                      <span className="text-xs font-bold text-white">HIPAA</span>
                    </div>
                  </div>
                </div>

                {/* Code Lines Effect */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent p-6">
                  <div className="space-y-2 font-mono text-xs text-white/40">
                    <div className="flex gap-2">
                      <span className="text-primary">encrypt</span>
                      <span>(</span>
                      <span className="text-emerald-400">"patient_data"</span>
                      <span>)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary">verify</span>
                      <span>(</span>
                      <span className="text-emerald-400">"access_token"</span>
                      <span>)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary">audit_log</span>
                      <span>(</span>
                      <span className="text-emerald-400">"record_access"</span>
                      <span>)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Security</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground md:text-5xl">
                Enterprise-Grade
                <br />
                <span className="text-primary">Security</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Your health data deserves the highest level of protection. 
                Our system is built with security at its core.
              </p>
              
              <ul className="mt-10 space-y-5">
                {[
                  { text: "End-to-end encryption for all records", detail: "Military-grade AES-256 encryption" },
                  { text: "HIPAA compliant infrastructure", detail: "Full regulatory compliance" },
                  { text: "Multi-factor authentication", detail: "Biometric & hardware key support" },
                  { text: "Regular security audits", detail: "Quarterly penetration testing" },
                ].map((item, index) => (
                  <li 
                    key={item.text} 
                    className="flex items-start gap-4 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg shadow-primary/25 transition-transform group-hover:scale-110">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{item.text}</span>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About / CTA Section */}
      <section id="about" className="relative py-24 scroll-mt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">About Us</span>
            </div>
            
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">
              Empowering Patients
              <br />
              <span className="text-primary">Everywhere</span>
            </h2>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe that patients should have complete ownership and control
              over their health data. Join thousands who've taken control of their
              health journey.
            </p>

            {/* Final CTA */}
            <div className="mt-12 inline-flex flex-col sm:flex-row items-center gap-4">
              <Button 
                asChild 
                size="xl" 
                className="group bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-xl shadow-primary/25"
              >
                <Link to="/patient">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Free to get started • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Digital Health Records</span>
            </Link>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => scrollToSection("features")} className="hover:text-foreground transition-colors">Features</button>
              <button onClick={() => scrollToSection("security")} className="hover:text-foreground transition-colors">Security</button>
              <button onClick={() => scrollToSection("about")} className="hover:text-foreground transition-colors">About</button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Digital Health Records. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
