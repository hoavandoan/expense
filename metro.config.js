const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;


config.resolver.resolveRequest = (context, moduleName, platform) => {

    if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
        //? Resolve to its CommonJS entry (fallback to main/index.js)
        return {
            type: 'sourceFile',
            //? require.resolve will pick up the CJS entry (index.js) since "exports" is bypassed
            filePath: require.resolve(moduleName),
        };
    }

    return context.resolveRequest(context, moduleName, platform);
};

// your metro modifications

module.exports = withUniwindConfig(config, {
    // relative path to your global.css file (from previous step)
    cssEntryFile: './app/global.css',
    // (optional) path where we gonna auto-generate typings
    // defaults to project's root
    dtsFile: './app/uniwind-types.d.ts'
});
