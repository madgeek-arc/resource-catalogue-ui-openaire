// These libraries ship no type declarations, so their imports are typed as any on purpose rather than implicitly.
// Installing @types/pdfmake or @types/seedrandom would replace a line here with real types (uikit has @types/uikit).
declare module 'pdfmake/build/pdfmake';
declare module 'pdfmake/build/vfs_fonts';
declare module 'seedrandom';
