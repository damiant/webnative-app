import * as esbuild from 'esbuild';

const isDev = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/auto.ts'],
  bundle: true,
  format: 'iife',
  outfile: 'dist/sdk.js',
  sourcemap: true,
};

if (isDev) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for changes…');
} else {
  await esbuild.build({ ...config, minify: true });
  console.log('✓ Build complete → dist/sdk.js');
}
