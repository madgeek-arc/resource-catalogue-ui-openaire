// These libraries ship no type declarations, so their imports are typed as any on purpose rather than implicitly.
// Installing @types/pdfmake, @types/seedrandom or @types/uikit would replace a line here with real types.
declare module 'uikit';
declare module 'pdfmake/build/pdfmake';
declare module 'pdfmake/build/vfs_fonts';
declare module 'seedrandom';
