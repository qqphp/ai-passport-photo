import { BookOpen, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <a
            href="https://qqphp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            阿雷博客
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            开源地址
          </a>
        </div>
      </div>
    </footer>
  );
}
