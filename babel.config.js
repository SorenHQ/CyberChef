export default function(api) {
    api.cache.forever();

    return {
        presets: [
            ["@babel/preset-env", {
                modules: false,        // Preserves ES Modules
                useBuiltIns: "entry",  // Polyfills based on browser targets
                corejs: 3,             // Uses core-js@3 for polyfills
                targets: "> 0.25%, not dead" // (Optional) Explicit targets
            }]
        ],
        plugins: [
            // Removed "dynamic-import-node" (incompatible with ESM)
            "@babel/plugin-syntax-import-assertions", // For JSON imports
            [
                "babel-plugin-transform-builtin-extend", {
                    globals: ["Error"]
                }
            ],
            [
                "@babel/plugin-transform-runtime", {
                    regenerator: true,
                    useESModules: true // ← Critical for ESM output
                }
            ]
        ]
    };
};