import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, User, Stethoscope, Shield, FileText, Lock } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                HealthRecord
              </h1>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#security"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Security
            </a>
            <a
              href="#about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              Patient-Owned Health Records
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Your Health Data,{" "}
            <span className="text-primary">Your Control</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            A secure digital health record system that puts patients in control.
            Manage your medical records, grant access to healthcare providers,
            and track every interaction.
          </p>

          {/* Role Selection */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link to="/patient">
                <User className="mr-2 h-5 w-5" />
                Patient Portal
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className="w-full sm:w-auto"
            >
              <Link to="/doctor">
                <Stethoscope className="mr-2 h-5 w-5" />
                Doctor Portal
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Select your role to access the demo dashboard
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Complete Health Record Management
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to manage, share, and protect your health
              information.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Centralized Records",
                description:
                  "Store all your medical documents in one secure location. Lab results, prescriptions, scans, and reports.",
              },
              {
                icon: Shield,
                title: "Granular Access Control",
                description:
                  "Decide exactly who can see your records. Grant, modify, or revoke access at any time.",
              },
              {
                icon: Lock,
                title: "Complete Audit Trail",
                description:
                  "Track every access to your records. Know who viewed what and when.",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="stat-card animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Enterprise-Grade Security
              </h2>
              <p className="mt-4 text-muted-foreground">
                Your health data deserves the highest level of protection. Our
                system is built with security at its core.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "End-to-end encryption for all records",
                  "HIPAA compliant infrastructure",
                  "Multi-factor authentication",
                  "Regular security audits",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                      <Shield className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <div className="space-y-4">
                <div className="h-3 w-3/4 rounded-full bg-muted" />
                <div className="h-3 w-1/2 rounded-full bg-muted" />
                <div className="h-3 w-5/6 rounded-full bg-muted" />
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="h-20 rounded-lg bg-primary/5" />
                  <div className="h-20 rounded-lg bg-primary/10" />
                  <div className="h-20 rounded-lg bg-primary/5" />
                </div>
                <div className="h-3 w-2/3 rounded-full bg-muted" />
                <div className="h-3 w-1/2 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">HealthRecord</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Digital Health Record System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
