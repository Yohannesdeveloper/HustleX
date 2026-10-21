import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distIndex = join(root, "dist", "index.html");

const routes = [
  {
    path: "job-listings",
    title: "Find Jobs | HustleX",
    description: "Browse freelance jobs in web development, design, marketing, and AI on HustleX.",
  },
  {
    path: "post-job",
    title: "Post a Job | HustleX",
    description: "Post a project and hire verified freelancers on HustleX.",
  },
  {
    path: "how-it-works",
    title: "How It Works | HustleX",
    description: "Learn how HustleX connects clients with freelance talent.",
  },
  {
    path: "pricing",
    title: "Pricing | HustleX",
    description: "Simple, transparent pricing for clients and freelancers on HustleX.",
  },
  {
    path: "about-us",
    title: "About | HustleX",
    description: "HustleX is Ethiopia's freelance marketplace connecting businesses with top talent.",
  },
  {
    path: "blog",
    title: "Blog | HustleX",
    description: "Tips and insights for freelancers and businesses on HustleX.",
  },
  {
    path: "faq",
    title: "FAQ | HustleX",
    description: "Answers to common questions about hiring and working on HustleX.",
  },
  {
    path: "contact-us",
    title: "Contact | HustleX",
    description: "Get in touch with HustleX support.",
  },
  {
    path: "help-center",
    title: "Help Center | HustleX",
    description: "Guides and support for using HustleX.",
  },
  {
    path: "signup",
    title: "Sign Up | HustleX",
    description: "Create a free HustleX account to hire talent or find freelance work.",
  },
];

const indexHtml = readFileSync(distIndex, "utf8");

for (const route of routes) {
  const url = `https://hustlexet.com/${route.path}`;
  let html = indexHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(
      /<meta name="title" content="[^"]*" \/>/,
      `<meta name="title" content="${route.title}" />`
    )
    .replace(
      /<meta name="description"([^>]*) content="[^"]*"/,
      `<meta name="description"$1 content="${route.description}"`
    )
    .replace(
      /rel="canonical" href="[^"]*"/,
      `rel="canonical" href="${url}"`
    )
    .replace(
      /property="og:url" content="[^"]*"/,
      `property="og:url" content="${url}"`
    )
    .replace(
      /property="og:title" content="[^"]*"/,
      `property="og:title" content="${route.title}"`
    )
    .replace(
      /property="og:description" content="[^"]*"/,
      `property="og:description" content="${route.description}"`
    );

  const outFile = join(root, "dist", route.path, "index.html");
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html);
  console.log(`Prerendered /${route.path}`);
}
