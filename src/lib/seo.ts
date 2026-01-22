import { useEffect } from "react";

export function useSeo(options: {
  title: string;
  description?: string;
  image?: string;
}) {
  const { title, description, image } = options;

  useEffect(() => {
    document.title = title;

    if (description) {
      let meta = document.querySelector(
        'meta[name="description"]'
      ) as HTMLMetaElement | null;

      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }

      meta.content = description;
    }

    const upsert = (property: string, content: string) => {
      let tag = document.querySelector(
        `meta[property="${property}"]`
      ) as HTMLMetaElement | null;

      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }

      tag.content = content;
    };

    upsert("og:title", title);
    if (description) upsert("og:description", description);
    if (image) upsert("og:image", image);
  }, [title, description, image]);
}