This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

react.development.js:1426 Uncaught TypeError: Object.defineProperty called on non-object
    at Object.defineProperty (<anonymous>)
    at __webpack_require__.r (webpack.js?v=1756872238620:265:21)
    at eval (pdf.mjs:1:21)
    at (app-pages-browser)/node_modules/pdfjs-dist/build/pdf.mjs (http://localhost:3000/_next/static/chunks/_app-pages-browser_src_components_common_LocalPDFViewer_tsx.js:60:1)
    at options.factory (webpack.js?v=1756872238620:716:31)
    at __webpack_require__ (webpack.js?v=1756872238620:37:33)
    at fn (webpack.js?v=1756872238620:371:21)
    at eval (LocalPDFViewer.tsx:9:68)
    at (app-pages-browser)/src/components/common/LocalPDFViewer.tsx (http://localhost:3000/_next/static/chunks/_app-pages-browser_src_components_common_LocalPDFViewer_tsx.js:29:1)
    at options.factory (webpack.js?v=1756872238620:716:31)
    at __webpack_require__ (webpack.js?v=1756872238620:37:33)
    at fn (webpack.js?v=1756872238620:371:21)

    PS C:\dev\mot_prj> npm -version
10.7.0
PS C:\dev\mot_prj> node -v


Unhandled Runtime Error
TypeError: Object.defineProperty called on non-object

Call Stack
Object.defineProperty
<anonymous>
__webpack_require__.r
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/webpack.js (265:21)
eval
webpack-internal:/(app-pages-browser)/node_modules/pdfjs-dist/build/pdf.mjs (1:21)
(app-pages-browser)/./node_modules/pdfjs-dist/build/pdf.mjs
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/_app-pages-browser_src_components_common_LocalPDFViewer_tsx.js (39:1)
options.factory
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/webpack.js (716:31)
__webpack_require__
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/webpack.js (37:33)
fn
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/webpack.js (371:21)
eval
webpack-internal:/(app-pages-browser)/src/components/common/LocalPDFViewer.tsx (9:68)
(app-pages-browser)/./src/components/common/LocalPDFViewer.tsx
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/_app-pages-browser_src_components_common_LocalPDFViewer_tsx.js (18:1)
options.factory
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/webpack.js (716:31)
__webpack_require__
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/webpack.js (37:33)
fn
file:///C:/A-Cursor/MOT_Club/Frontend/mot/dist/static/chunks/webpack.js (371:21)