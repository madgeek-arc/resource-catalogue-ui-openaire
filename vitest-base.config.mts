import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    server: {
      deps: {
        // Angular libraries are run through Vite: left to Node they would load a second copy of @angular/core.
        // ng2-date-picker imports dayjs plugins without a file extension, which only Vite resolves.
        // ngx-tiptap is an Angular library too: left to Node it would load a second copy of @angular/core.
        inline: [/@angular\//, /ng2-date-picker/, /ngx-tiptap/],
      },
    },
  },
});
