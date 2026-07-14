"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import styles from "./CrmAdminLogin.module.css";

type LoginForm = {
    email: string;
    password: string;
};

function CrmAdminLoginInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const submittedRef = useRef(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {
        if (isLoading || submittedRef.current) return;
        submittedRef.current = true;
        setIsLoading(true);

        try {
            const email = String(data.email ?? "").trim();
            const password = String(data.password ?? "");
            const rawNext = searchParams.get("next") || "/crm-admin";
            // Zone + national CRM always stay inside CRM admin (never main site login/dashboard).
            const next =
                rawNext.startsWith("/crm-admin") && !rawNext.startsWith("/crm-admin/login")
                    ? rawNext
                    : "/crm-admin";

            const { user } = await login(email, password, {
                authPath: "/auth/crm/login/",
            });

            if (user.role !== "crm") {
                throw new Error("This login is for CRM accounts only.");
            }

            toast.success("Login successful!");
            router.replace(next);
        } catch (error) {
            submittedRef.current = false;
            const msg = error instanceof Error ? error.message : "Invalid credentials";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Toaster position="top-center" />
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoWrap}>
                        <Image
                            src="/crm/logo.png"
                            alt="T.I.M.E. Kids - the pre-school that cares"
                            width={240}
                            height={100}
                            className={styles.logo}
                            priority
                            unoptimized
                        />
                    </div>
                    <h1 className={styles.title}>CRM Admin Login</h1>
                    <p className={styles.subtitle}>Sign in to access the CRM dashboard</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div>
                        <label className={styles.label} htmlFor="crm-email">
                            Email
                        </label>
                        <input
                            id="crm-email"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address",
                                },
                            })}
                            className={styles.input}
                            placeholder="admin@timekids.com"
                            autoComplete="email"
                        />
                        {errors.email ? <p className={styles.error}>{errors.email.message}</p> : null}
                    </div>

                    <div>
                        <label className={styles.label} htmlFor="crm-password">
                            Password
                        </label>
                        <input
                            id="crm-password"
                            type="password"
                            {...register("password", { required: "Password is required" })}
                            className={styles.input}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                        {errors.password ? <p className={styles.error}>{errors.password.message}</p> : null}
                    </div>

                    <button type="submit" disabled={isLoading} className={styles.submit}>
                        {isLoading ? <span className={styles.spinner} aria-hidden /> : null}
                        {isLoading ? "Signing in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function CrmAdminLogin() {
    return (
        <Suspense
            fallback={
                <div className={styles.page}>
                    <div className={styles.card}>Loading…</div>
                </div>
            }
        >
            <CrmAdminLoginInner />
        </Suspense>
    );
}
