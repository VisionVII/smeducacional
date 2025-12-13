import nextConfig from "eslint-config-next";

export default [
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
    ...nextConfig,
];