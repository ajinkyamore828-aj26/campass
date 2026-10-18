import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  MailCheck,
} from "lucide-react";
import { useCampusPass } from "@/context/CampusPassContext";
import { CampusPassLogo } from "@/assets/logo-icon";

// Social SVGs (Official Brands)
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="currentColor"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
      fill="currentColor"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
      fill="currentColor"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="currentColor"
    />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export interface Auth8Props {
  initialRole?: 'STUDENT' | 'ADMIN';
  onLoginSuccess?: (role: 'STUDENT' | 'ADMIN') => void;
  onBack?: () => void;
}

export default function Auth8({
  initialRole = 'STUDENT',
  onLoginSuccess,
  onBack,
}: Auth8Props) {
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>(initialRole);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Controlled form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState(
    initialRole === 'STUDENT' ? 'ajinkya_more' : 'sk_joshi'
  );
  const [email, setEmail] = useState(
    initialRole === 'STUDENT' ? 'ajinkya.more@axiogen.in' : 'faculty.lead@axiogen.in'
  );
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [magicLinkMessage, setMagicLinkMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { switchUserRole, setActivePortal, createUser, updateCurrentUser } = useCampusPass();

  const handleRoleSwitch = (newRole: 'STUDENT' | 'ADMIN') => {
    setRole(newRole);
    setErrorMessage(null);
    setMagicLinkMessage(null);
    
    // STRICT RULE: Admin / Faculty CANNOT create new accounts (Sign-in only)
    if (newRole === 'ADMIN') {
      setIsSignUp(false);
      setUsername('sk_joshi');
      setEmail('faculty.lead@axiogen.in');
    } else {
      setUsername('ajinkya_more');
      setEmail('ajinkya.more@axiogen.in');
    }
  };

  const executeLogin = (selectedRole: 'STUDENT' | 'ADMIN', customName?: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      let displayName = customName;
      if (!displayName && isSignUp && fullName.trim()) {
        displayName = fullName.trim();
      } else if (!displayName && username.trim()) {
        const u = username.trim();
        if (u.includes('_') || u.includes('.')) {
          displayName = u.split(/[_.]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        } else {
          displayName = u.charAt(0).toUpperCase() + u.slice(1);
        }
      } else if (!displayName && selectedRole === 'ADMIN') {
        displayName = 'Prof. S.K. Joshi';
      }

      if (displayName) {
        updateCurrentUser({
          fullName: displayName,
          email: email.trim() || undefined,
          role: selectedRole,
        });
      }

      // Sync global application context
      switchUserRole(selectedRole, displayName);
      setActivePortal(selectedRole);

      if (onLoginSuccess) {
        onLoginSuccess(selectedRole);
      } else {
        // Fallback route navigation
        window.location.href = selectedRole === 'ADMIN' ? '/admin' : '/students';
      }
      setIsSubmitting(false);
    }, 350);
  };

  const handleMagicLink = () => {
    setErrorMessage(null);
    const targetEmail = email.trim() || (isStudent ? 'ajinkya.more@axiogen.in' : 'faculty.lead@axiogen.in');
    setEmail(targetEmail);
    setMagicLinkMessage(`Magic verification link dispatched to ${targetEmail}. Instant access activated!`);
    
    setTimeout(() => {
      executeLogin(role);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMagicLinkMessage(null);

    // If new student sign up mode
    if (isSignUp) {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please re-enter your password.");
        return;
      }

      setIsSubmitting(true);
      try {
        await createUser({
          fullName: fullName.trim(),
          email: email.trim(),
          role: 'STUDENT',
          studentId: 'STU-' + Math.floor(1000 + Math.random() * 9000),
          academicYear: 'UG 2026',
        });
      } catch {
        // Continue to sign in even if offline
      }
      executeLogin('STUDENT', fullName.trim());
      return;
    }

    // Standard sign-in mode
    executeLogin(role);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const isStudent = role === 'STUDENT';

  return (
    <div className="auth8-container flex min-h-screen w-full flex-col lg:flex-row bg-[#050505] font-sans text-white antialiased selection:bg-orange-500/30 selection:text-white">
      {/* Left Image Panel */}
      <div className="auth8-panel-left relative flex w-full flex-col justify-between overflow-hidden min-h-[40vh] lg:min-h-screen lg:w-1/2">
        {/* Background Image */}
        <img
          src="https://assets.watermelon.sh/auth-8.avif"
          alt="Vibrant abstract background"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between p-6 sm:p-10">
          {/* CampusPass Official Vector Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/50 backdrop-blur-md border border-white/10 p-1">
              <CampusPassLogo className="h-full w-full" variant="duotone" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white drop-shadow-sm leading-tight">
                CampusPass
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
                Team Axiogen Core
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </button>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 p-6 sm:p-10 pb-16 lg:pb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md text-orange-200">
            {isStudent ? (
              <>
                <GraduationCap className="h-3.5 w-3.5 text-orange-400" />
                {isSignUp ? "New Student Registration" : "Student & Attendee Gateway"}
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                Faculty & Administrator Portal
              </>
            )}
          </div>
          <h1 className="mb-4 text-4xl sm:text-5xl font-semibold leading-[1.12] tracking-tight text-white xl:text-6xl">
            {isStudent ? (
              isSignUp ? (
                <>
                  Create Your<br />
                  Student Pass.
                </>
              ) : (
                <>
                  Where Innovation<br />
                  Meets Impact.
                </>
              )
            ) : (
              <>
                Centralized College<br />
                Event Infrastructure.
              </>
            )}
          </h1>
          <p className="max-w-lg text-base sm:text-lg text-white/85 leading-relaxed">
            {isStudent
              ? isSignUp
                ? "Register your student credentials to claim verified event admissions, smart RFID passcards, and dining QR passes."
                : "Access premier college hackathons, technical workshops, and retrieve your cryptographic QR gate passes instantly."
              : "Institutional management suite: turnstile clearances, attendee lists, live telemetry, and event rescheduling controls."}
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth8-panel-right flex w-full flex-col items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md md:max-w-lg"
        >
          {/* Role Switcher Pills */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex rounded-xl bg-[#141414] p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => handleRoleSwitch('STUDENT')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isStudent
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                {isSignUp ? "New Student Sign Up" : "Student Login"}
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  !isStudent
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin & Faculty Login
              </button>
            </div>
          </motion.div>

          {/* Social Sign-In: Google, Github, Magic Link */}
          <motion.div variants={itemVariants} className="mb-6">
            <p className="mb-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Fast Institutional Sign In:
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => executeLogin(role)}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#141414] py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] focus:outline-none focus:ring-1 focus:ring-neutral-700 border border-neutral-800 cursor-pointer"
                title="Sign in with Google Workspace"
              >
                <GoogleIcon className="size-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => executeLogin(role)}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#141414] py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] focus:outline-none focus:ring-1 focus:ring-neutral-700 border border-neutral-800 cursor-pointer"
                title="Sign in with GitHub"
              >
                <GithubIcon className="size-4" />
                Github
              </button>
              <button
                type="button"
                onClick={handleMagicLink}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#141414] py-2.5 text-xs sm:text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors hover:bg-[#1f1f1f] focus:outline-none focus:ring-1 focus:ring-sky-500/50 border border-neutral-800 cursor-pointer"
                title="Instant passwordless email magic link"
              >
                <Sparkles className="size-3.5" />
                Magic Link
              </button>
            </div>
          </motion.div>

          {/* Inline Feedback Messages */}
          {magicLinkMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2.5 rounded-lg border border-sky-800/60 bg-sky-950/40 p-3 text-xs text-sky-300"
            >
              <MailCheck className="size-4 shrink-0 text-sky-400" />
              <span>{magicLinkMessage}</span>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2.5 rounded-lg border border-rose-900/60 bg-rose-950/50 p-3 text-xs text-rose-300"
            >
              <AlertCircle className="size-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="relative mb-6 flex items-center"
          >
            <div className="grow border-t border-neutral-800"></div>
            <span className="px-3 text-xs uppercase tracking-wider text-neutral-500">
              {isSignUp ? "Enter Account Details" : "Or Institutional Credentials"}
            </span>
            <div className="grow border-t border-neutral-800"></div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ── CASE A: NEW STUDENT SIGN UP (EXACTLY 4 FIELDS: Full Name, Email ID, Create Password, Confirm Password) ── */}
            {isSignUp && isStudent ? (
              <>
                {/* 1. Full Name */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                  <label
                    htmlFor="fullName"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <User className="size-4" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ajinkya More"
                      required
                      autoFocus
                      className="w-full rounded-lg border border-neutral-800 bg-[#111111] py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-[#161616] focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-all"
                    />
                  </div>
                </motion.div>

                {/* 2. Email ID */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    Email ID (or Institutional Gmail)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <Mail className="size-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@axiogen.in or student@gmail.com"
                      required
                      className="w-full rounded-lg border border-neutral-800 bg-[#111111] py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-[#161616] focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-all"
                    />
                  </div>
                </motion.div>

                {/* 3. Create Password */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    Create Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <Lock className="size-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      required
                      className="w-full rounded-lg border border-neutral-800 bg-[#111111] py-3 pl-10 pr-10 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-[#161616] focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* 4. Confirm Password */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <Lock className="size-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full rounded-lg border border-neutral-800 bg-[#111111] py-3 pl-10 pr-10 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-[#161616] focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              /* ── CASE B: EXISTING SIGN-IN (Student or Faculty Admin) ── */
              <>
                {/* Username / PRN */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                  <label
                    htmlFor="username"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    {isStudent ? "Student PRN / Username" : "Faculty ID / Staff Code"}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <User className="size-4" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isStudent ? "e.g. STU-2023-CS-041" : "e.g. FAC-2024-ADM-01"}
                      required
                      className="w-full rounded-lg border border-neutral-800 bg-[#111111] py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-[#161616] focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-all"
                    />
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    Institutional Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <Mail className="size-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isStudent ? "student@axiogen.in" : "faculty@axiogen.in"}
                      required
                      className="w-full rounded-lg border border-neutral-800 bg-[#111111] py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-[#161616] focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-all"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword('password123')}
                      className="text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Reset default
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <Lock className="size-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-neutral-800 bg-[#111111] py-3 pl-10 pr-10 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-[#161616] focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {/* Primary Action Button */}
            <motion.div variants={itemVariants} className="mt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-white py-3 text-sm font-bold text-neutral-950 transition-all hover:bg-neutral-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(255,255,255,0.15)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-neutral-900" />
                    {/* User Rule: Existing student shows "Sign In", New student shows "Create & Sign In" */}
                    <span>
                      {isSignUp
                        ? "Create & Sign In"
                        : isStudent
                        ? "Sign In to Student Portal"
                        : "Sign In to Admin Portal"}
                    </span>
                  </>
                )}
              </button>

              {/* Instant 1-Click Demo Login (Only in Sign-in mode) */}
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => executeLogin(role)}
                  className="w-full rounded-lg bg-neutral-900 border border-neutral-800 py-2.5 text-xs font-semibold text-neutral-300 transition-all hover:bg-neutral-800 hover:text-white cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Demo Fast Track: 1-Click {isStudent ? 'Student Sign In (Ajinkya More)' : 'Faculty Admin Sign In'}</span>
                </button>
              )}
            </motion.div>
          </form>

          {/* Institutional Clearance Notice for Admin / Faculty */}
          {!isStudent && (
            <motion.div
              variants={itemVariants}
              className="mt-4 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-3 text-center text-xs text-neutral-400"
            >
              <div className="flex items-center justify-center gap-1.5 font-semibold text-neutral-300 mb-0.5">
                <ShieldCheck className="size-3.5 text-sky-400" />
                <span>Institutional Clearance Notice</span>
              </div>
              Faculty & Administrator accounts are pre-provisioned by Campus Dean. Self-registration is restricted.
            </motion.div>
          )}

          {/* Footer Terms */}
          <motion.div
            variants={itemVariants}
            className="mt-5 text-[12px] leading-relaxed text-neutral-400 text-center"
          >
            Authorized access protected by Team Axiogen cryptographic token engine.
            <br />
            By signing in, you adhere to the{" "}
            <a href="#" className="underline hover:text-white">
              Terms of Institutional Service
            </a>
            .
          </motion.div>

          {/* Bottom Login / SignUp Toggle Link */}
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center text-xs text-neutral-300 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            {/* User Rule: Only students can create accounts; Faculty/Admin cannot self-register */}
            {isStudent ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMagicLinkMessage(null);
                  setIsSignUp(!isSignUp);
                }}
                className="text-neutral-400 hover:text-white underline cursor-pointer"
              >
                {isSignUp ? "Already have an account? Sign In" : "New student? Create account"}
              </button>
            ) : null}

            {isStudent && <span className="hidden sm:inline text-neutral-700">•</span>}

            <button
              type="button"
              onClick={() => handleRoleSwitch(isStudent ? 'ADMIN' : 'STUDENT')}
              className="font-medium text-orange-400 hover:underline cursor-pointer"
            >
              Switch to {isStudent ? 'Admin & Faculty Login' : 'Student Login'}
            </button>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth8-container {
            display: flex !important;
            flex-direction: row !important;
          }
          .auth8-panel-left {
            width: 50% !important;
            min-height: 100vh !important;
          }
          .auth8-panel-right {
            width: 50% !important;
            min-height: 100vh !important;
          }
        }
        @media (max-width: 1023px) {
          .auth8-container {
            display: flex !important;
            flex-direction: column !important;
          }
          .auth8-panel-left {
            width: 100% !important;
            min-height: 380px !important;
          }
          .auth8-panel-right {
            width: 100% !important;
            padding-top: 36px !important;
            padding-bottom: 48px !important;
          }
        }
      `}</style>
    </div>
  );
}
