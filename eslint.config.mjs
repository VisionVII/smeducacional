import nextConfig from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";

export default [
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "react-hooks/exhaustive-deps": "warn",
            // React 19 rule too noisy for existing mounted flags
            "react-hooks/set-state-in-effect": "off",
            // Allow plain quotes without escaping
            "react/no-unescaped-entities": "warn",
        },
    },
    ...nextConfig,
    {
        rules: {
            // Re-assert overrides after Next config merge
            "react-hooks/set-state-in-effect": "off",
            "react/no-unescaped-entities": "warn",
        },
    },
];